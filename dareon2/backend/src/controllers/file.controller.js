const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/errorResponse');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs').promises;
const pdf = require('pdf-parse');

class FileController {
  // @desc    Upload files
  // @route   POST /api/files/upload
  // @access  Private
  uploadFiles = asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      throw new ErrorResponse('Please upload files', 400);
    }

    const uploadedFiles = [];
    const userId = req.user.id;
    const userStoragePath = path.join(__dirname, `../storage/${userId}`);

    // Create user storage directory if it doesn't exist
    await fs.mkdir(userStoragePath, { recursive: true });

    for (const file of req.files) {
      const fileInfo = {
        originalName: file.originalname,
        fileName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        path: path.join(userStoragePath, file.filename),
        uploadDate: new Date(),
        metadata: {}
      };

      // Extract metadata for PDF files
      if (file.mimetype === 'application/pdf') {
        const dataBuffer = await fs.readFile(file.path);
        const pdfData = await pdf(dataBuffer);
        fileInfo.metadata = {
          pageCount: pdfData.numpages,
          info: pdfData.info,
          metadata: pdfData.metadata
        };
      }

      // Update user storage stats
      await req.user.updateStorageStats(file.size);
      await req.user.incrementFilesManaged();

      uploadedFiles.push(fileInfo);

      logger.logFileOperation('upload', fileInfo, userId);
    }

    res.status(200).json({
      success: true,
      count: uploadedFiles.length,
      data: uploadedFiles
    });
  });

  // @desc    Get all files
  // @route   GET /api/files
  // @access  Private
  getFiles = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const userStoragePath = path.join(__dirname, `../storage/${userId}`);
    
    const files = await this.getAllFilesRecursively(userStoragePath);
    
    res.status(200).json({
      success: true,
      count: files.length,
      data: files
    });
  });

  // @desc    Sort files
  // @route   POST /api/files/sort
  // @access  Private
  sortFiles = asyncHandler(async (req, res) => {
    const { sortBy } = req.body;
    const userId = req.user.id;
    const userStoragePath = path.join(__dirname, `../storage/${userId}`);

    let files = await this.getAllFilesRecursively(userStoragePath);

    switch (sortBy) {
      case 'type':
        files = this.sortByType(files);
        break;
      case 'date':
        files = this.sortByDate(files);
        break;
      case 'size':
        files = this.sortBySize(files);
        break;
      case 'name':
        files = this.sortByName(files);
        break;
      default:
        throw new ErrorResponse('Invalid sort parameter', 400);
    }

    res.status(200).json({
      success: true,
      data: files
    });
  });

  // @desc    Search files
  // @route   GET /api/files/search
  // @access  Private
  searchFiles = asyncHandler(async (req, res) => {
    const { query } = req.query;
    const userId = req.user.id;
    const userStoragePath = path.join(__dirname, `../storage/${userId}`);

    const files = await this.getAllFilesRecursively(userStoragePath);
    const searchResults = files.filter(file => 
      file.originalName.toLowerCase().includes(query.toLowerCase()) ||
      (file.metadata && JSON.stringify(file.metadata).toLowerCase().includes(query.toLowerCase()))
    );

    res.status(200).json({
      success: true,
      count: searchResults.length,
      data: searchResults
    });
  });

  // @desc    Get file statistics
  // @route   GET /api/files/stats
  // @access  Private
  getFileStats = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const userStoragePath = path.join(__dirname, `../storage/${userId}`);

    const files = await this.getAllFilesRecursively(userStoragePath);
    const stats = {
      totalFiles: files.length,
      totalSize: files.reduce((acc, file) => acc + file.size, 0),
      byType: this.groupByType(files),
      byDate: this.groupByDate(files),
      bySize: this.groupBySize(files)
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  });

  // Helper methods
  async getAllFilesRecursively(dirPath) {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    const files = await Promise.all(entries.map(async (entry) => {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        return this.getAllFilesRecursively(fullPath);
      }

      const stats = await fs.stat(fullPath);
      return {
        name: entry.name,
        path: fullPath,
        size: stats.size,
        type: path.extname(entry.name).slice(1),
        modifiedDate: stats.mtime
      };
    }));

    return files.flat();
  }

  sortByType(files) {
    return files.sort((a, b) => a.type.localeCompare(b.type));
  }

  sortByDate(files) {
    return files.sort((a, b) => b.modifiedDate - a.modifiedDate);
  }

  sortBySize(files) {
    return files.sort((a, b) => b.size - a.size);
  }

  sortByName(files) {
    return files.sort((a, b) => a.name.localeCompare(b.name));
  }

  groupByType(files) {
    return files.reduce((acc, file) => {
      const type = file.type || 'unknown';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
  }

  groupByDate(files) {
    return files.reduce((acc, file) => {
      const date = file.modifiedDate.toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
  }

  groupBySize(files) {
    const sizeRanges = {
      tiny: { max: 100 * 1024 }, // 100KB
      small: { max: 1024 * 1024 }, // 1MB
      medium: { max: 10 * 1024 * 1024 }, // 10MB
      large: { max: 100 * 1024 * 1024 }, // 100MB
      huge: { max: Infinity }
    };

    return files.reduce((acc, file) => {
      const size = file.size;
      for (const [range, { max }] of Object.entries(sizeRanges)) {
        if (size <= max) {
          acc[range] = (acc[range] || 0) + 1;
          break;
        }
      }
      return acc;
    }, {});
  }
}

module.exports = new FileController();
