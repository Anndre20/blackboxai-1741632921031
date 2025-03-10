const request = require('supertest');
const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const app = require('../index');
const User = require('../models/user.model');
const { setupTestDB, createTestUser, mockFileSystem } = require('./utils/testSetup');

setupTestDB();
mockFileSystem();

describe('File Management Endpoints', () => {
  let user;
  let token;
  let testFilePath;

  beforeEach(async () => {
    // Create test user
    user = await createTestUser(User);
    token = user.getSignedJwtToken();

    // Create test file
    testFilePath = path.join(__dirname, 'test-files/test.pdf');
    await fs.mkdir(path.dirname(testFilePath), { recursive: true });
    await fs.writeFile(testFilePath, 'Test file content');
  });

  afterEach(async () => {
    await fs.rm(path.dirname(testFilePath), { recursive: true, force: true });
  });

  describe('POST /api/files/upload', () => {
    it('should upload a file successfully', async () => {
      const res = await request(app)
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('files', testFilePath);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data[0]).toHaveProperty('originalName', 'test.pdf');
      expect(res.body.data[0]).toHaveProperty('mimeType', 'application/pdf');

      // Verify user storage stats were updated
      const updatedUser = await User.findById(user._id);
      expect(updatedUser.stats.filesManaged).toBe(1);
      expect(updatedUser.stats.storageUsed).toBeGreaterThan(0);
    });

    it('should not upload file without authentication', async () => {
      const res = await request(app)
        .post('/api/files/upload')
        .attach('files', testFilePath);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty('success', false);
    });

    it('should handle file size limits', async () => {
      // Create large file that exceeds limit
      const largePath = path.join(__dirname, 'test-files/large.pdf');
      const largeContent = Buffer.alloc(101 * 1024 * 1024); // 101MB
      await fs.writeFile(largePath, largeContent);

      const res = await request(app)
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('files', largePath);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toMatch(/file size/i);

      await fs.unlink(largePath);
    });

    it('should handle invalid file types', async () => {
      const invalidPath = path.join(__dirname, 'test-files/test.exe');
      await fs.writeFile(invalidPath, 'Invalid file content');

      const res = await request(app)
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('files', invalidPath);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
      expect(res.body.error).toMatch(/file type/i);

      await fs.unlink(invalidPath);
    });
  });

  describe('GET /api/files', () => {
    beforeEach(async () => {
      // Upload test files
      await request(app)
        .post('/api/files/upload')
        .set('Authorization', `Bearer ${token}`)
        .attach('files', testFilePath);
    });

    it('should get all files for user', async () => {
      const res = await request(app)
        .get('/api/files')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toBeInstanceOf(Array);
      expect(res.body.data.length).toBe(1);
    });

    it('should handle pagination', async () => {
      const res = await request(app)
        .get('/api/files')
        .query({ page: 1, limit: 10 })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('pagination');
      expect(res.body.pagination).toHaveProperty('page', 1);
      expect(res.body.pagination).toHaveProperty('limit', 10);
    });

    it('should filter files by type', async () => {
      const res = await request(app)
        .get('/api/files')
        .query({ type: 'pdf' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every(file => file.type === 'pdf')).toBe(true);
    });
  });

  describe('POST /api/files/sort', () => {
    beforeEach(async () => {
      // Upload multiple test files
      const files = ['test1.pdf', 'test2.docx', 'test3.jpg'];
      for (const file of files) {
        const filePath = path.join(__dirname, `test-files/${file}`);
        await fs.writeFile(filePath, 'Test content');
        await request(app)
          .post('/api/files/upload')
          .set('Authorization', `Bearer ${token}`)
          .attach('files', filePath);
      }
    });

    it('should sort files by type', async () => {
      const res = await request(app)
        .post('/api/files/sort')
        .set('Authorization', `Bearer ${token}`)
        .send({ sortBy: 'type' });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeSorted((a, b) => a.type.localeCompare(b.type));
    });

    it('should sort files by date', async () => {
      const res = await request(app)
        .post('/api/files/sort')
        .set('Authorization', `Bearer ${token}`)
        .send({ sortBy: 'date' });

      expect(res.status).toBe(200);
      expect(res.body.data).toBeSorted((a, b) => 
        new Date(b.modifiedDate) - new Date(a.modifiedDate)
      );
    });

    it('should handle invalid sort parameter', async () => {
      const res = await request(app)
        .post('/api/files/sort')
        .set('Authorization', `Bearer ${token}`)
        .send({ sortBy: 'invalid' });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('success', false);
    });
  });

  describe('GET /api/files/search', () => {
    beforeEach(async () => {
      // Upload test files with different names
      const files = ['report2023.pdf', 'meeting_notes.docx', 'presentation.pptx'];
      for (const file of files) {
        const filePath = path.join(__dirname, `test-files/${file}`);
        await fs.writeFile(filePath, 'Test content');
        await request(app)
          .post('/api/files/upload')
          .set('Authorization', `Bearer ${token}`)
          .attach('files', filePath);
      }
    });

    it('should search files by name', async () => {
      const res = await request(app)
        .get('/api/files/search')
        .query({ query: 'report' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toMatch(/report/i);
    });

    it('should search files by type', async () => {
      const res = await request(app)
        .get('/api/files/search')
        .query({ query: 'pdf' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.every(file => file.type === 'pdf')).toBe(true);
    });

    it('should handle no search results', async () => {
      const res = await request(app)
        .get('/api/files/search')
        .query({ query: 'nonexistent' })
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });
  });

  describe('GET /api/files/stats', () => {
    it('should get file statistics', async () => {
      const res = await request(app)
        .get('/api/files/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('totalFiles');
      expect(res.body.data).toHaveProperty('totalSize');
      expect(res.body.data).toHaveProperty('byType');
      expect(res.body.data).toHaveProperty('byDate');
    });

    it('should calculate correct statistics', async () => {
      // Upload some test files first
      const files = ['test1.pdf', 'test2.pdf', 'test3.docx'];
      for (const file of files) {
        const filePath = path.join(__dirname, `test-files/${file}`);
        await fs.writeFile(filePath, 'Test content');
        await request(app)
          .post('/api/files/upload')
          .set('Authorization', `Bearer ${token}`)
          .attach('files', filePath);
      }

      const res = await request(app)
        .get('/api/files/stats')
        .set('Authorization', `Bearer ${token}`);

      expect(res.body.data.totalFiles).toBe(3);
      expect(res.body.data.byType).toHaveProperty('pdf', 2);
      expect(res.body.data.byType).toHaveProperty('docx', 1);
    });
  });
});
