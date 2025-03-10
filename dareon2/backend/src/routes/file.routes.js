const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const {
  uploadFiles,
  getFiles,
  sortFiles,
  searchFiles,
  getFileStats
} = require('../controllers/file.controller');
const { protect, checkSubscription } = require('../middleware/auth');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userStoragePath = path.join(__dirname, `../storage/${req.user.id}`);
    cb(null, userStoragePath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const fileExt = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExt}`;
    cb(null, fileName);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max file size
    files: 10 // Max 10 files per upload
  }
});

// Routes

// @desc    Upload files
// @route   POST /api/files/upload
// @access  Private
router.post(
  '/upload',
  protect,
  checkSubscription('basic'),
  upload.array('files', 10),
  uploadFiles
);

// @desc    Get all files
// @route   GET /api/files
// @access  Private
router.get(
  '/',
  protect,
  getFiles
);

// @desc    Sort files
// @route   POST /api/files/sort
// @access  Private
router.post(
  '/sort',
  protect,
  sortFiles
);

// @desc    Search files
// @route   GET /api/files/search
// @access  Private
router.get(
  '/search',
  protect,
  searchFiles
);

// @desc    Get file statistics
// @route   GET /api/files/stats
// @access  Private
router.get(
  '/stats',
  protect,
  getFileStats
);

// @desc    Download file
// @route   GET /api/files/:id/download
// @access  Private
router.get(
  '/:id/download',
  protect,
  (req, res) => {
    // TODO: Implement file download
    res.status(501).json({
      success: false,
      message: 'Not implemented yet'
    });
  }
);

// @desc    Delete file
// @route   DELETE /api/files/:id
// @access  Private
router.delete(
  '/:id',
  protect,
  (req, res) => {
    // TODO: Implement file deletion
    res.status(501).json({
      success: false,
      message: 'Not implemented yet'
    });
  }
);

// @desc    Share file
// @route   POST /api/files/:id/share
// @access  Private
router.post(
  '/:id/share',
  protect,
  checkSubscription('premium'),
  (req, res) => {
    // TODO: Implement file sharing
    res.status(501).json({
      success: false,
      message: 'Not implemented yet'
    });
  }
);

// @desc    Get file metadata
// @route   GET /api/files/:id/metadata
// @access  Private
router.get(
  '/:id/metadata',
  protect,
  (req, res) => {
    // TODO: Implement metadata retrieval
    res.status(501).json({
      success: false,
      message: 'Not implemented yet'
    });
  }
);

// @desc    Update file metadata
// @route   PUT /api/files/:id/metadata
// @access  Private
router.put(
  '/:id/metadata',
  protect,
  (req, res) => {
    // TODO: Implement metadata update
    res.status(501).json({
      success: false,
      message: 'Not implemented yet'
    });
  }
);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File size too large. Maximum size is 100MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        error: 'Too many files. Maximum is 10 files per upload.'
      });
    }
  }
  
  if (error.message === 'Invalid file type') {
    return res.status(400).json({
      success: false,
      error: 'Invalid file type. Please upload only allowed file types.'
    });
  }

  next(error);
});

module.exports = router;
