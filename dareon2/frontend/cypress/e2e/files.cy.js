describe('File Management', () => {
  beforeEach(() => {
    // Login and visit dashboard before each test
    cy.loginByApi('test@example.com', 'Password123!');
    cy.visit('/dashboard');
  });

  describe('File Upload', () => {
    it('should upload single file successfully', () => {
      // Create test file
      cy.fixture('sample.pdf').as('sampleFile');
      
      // Upload file
      cy.get('[data-testid=file-upload-input]')
        .attachFile('@sampleFile');

      // Verify upload success
      cy.get('[data-testid=upload-success-message]')
        .should('be.visible')
        .and('contain', 'File uploaded successfully');

      // Verify file appears in list
      cy.get('[data-testid=file-list]')
        .should('contain', 'sample.pdf');
    });

    it('should upload multiple files', () => {
      // Create test files
      cy.fixture('sample1.pdf').as('file1');
      cy.fixture('sample2.docx').as('file2');
      
      // Upload files
      cy.get('[data-testid=file-upload-input]')
        .attachFile(['@file1', '@file2']);

      // Verify upload success
      cy.get('[data-testid=upload-success-message]')
        .should('be.visible')
        .and('contain', '2 files uploaded successfully');

      // Verify files appear in list
      cy.get('[data-testid=file-list]')
        .should('contain', 'sample1.pdf')
        .and('contain', 'sample2.docx');
    });

    it('should handle invalid file types', () => {
      // Try to upload invalid file
      cy.fixture('invalid.exe').as('invalidFile');
      cy.get('[data-testid=file-upload-input]')
        .attachFile('@invalidFile');

      // Verify error message
      cy.get('[data-testid=error-message]')
        .should('be.visible')
        .and('contain', 'Invalid file type');
    });

    it('should handle file size limits', () => {
      // Try to upload large file
      cy.fixture('large.pdf').as('largeFile');
      cy.get('[data-testid=file-upload-input]')
        .attachFile('@largeFile');

      // Verify error message
      cy.get('[data-testid=error-message]')
        .should('be.visible')
        .and('contain', 'File size exceeds limit');
    });
  });

  describe('File List', () => {
    beforeEach(() => {
      // Upload test files via API
      cy.uploadFileByApi('sample1.pdf');
      cy.uploadFileByApi('sample2.docx');
      cy.uploadFileByApi('sample3.jpg');
    });

    it('should display files with correct information', () => {
      cy.get('[data-testid=file-list]').within(() => {
        // Check file names
        cy.get('[data-testid=file-name]')
          .should('have.length', 3)
          .first()
          .should('contain', 'sample1.pdf');

        // Check file types
        cy.get('[data-testid=file-type]')
          .should('contain', 'PDF')
          .and('contain', 'Document')
          .and('contain', 'Image');

        // Check file sizes
        cy.get('[data-testid=file-size]')
          .should('exist');

        // Check upload dates
        cy.get('[data-testid=file-date]')
          .should('exist');
      });
    });

    it('should sort files', () => {
      // Sort by name
      cy.get('[data-testid=sort-by-name]').click();
      cy.get('[data-testid=file-name]')
        .first()
        .should('contain', 'sample1.pdf');

      // Sort by date
      cy.get('[data-testid=sort-by-date]').click();
      cy.get('[data-testid=file-date]')
        .first()
        .should('contain', 'Just now');

      // Sort by size
      cy.get('[data-testid=sort-by-size]').click();
      cy.get('[data-testid=file-size]')
        .should('be.sorted');
    });

    it('should filter files by type', () => {
      // Filter by PDF
      cy.get('[data-testid=filter-pdf]').click();
      cy.get('[data-testid=file-list]')
        .should('contain', 'sample1.pdf')
        .and('not.contain', 'sample2.docx')
        .and('not.contain', 'sample3.jpg');

      // Filter by Document
      cy.get('[data-testid=filter-document]').click();
      cy.get('[data-testid=file-list]')
        .should('contain', 'sample2.docx')
        .and('not.contain', 'sample1.pdf')
        .and('not.contain', 'sample3.jpg');
    });

    it('should search files', () => {
      // Search by name
      cy.get('[data-testid=search-input]')
        .type('sample1');

      cy.get('[data-testid=file-list]')
        .should('contain', 'sample1.pdf')
        .and('not.contain', 'sample2.docx')
        .and('not.contain', 'sample3.jpg');
    });
  });

  describe('File Actions', () => {
    beforeEach(() => {
      cy.uploadFileByApi('sample.pdf');
    });

    it('should download file', () => {
      cy.get('[data-testid=file-actions]')
        .first()
        .within(() => {
          cy.get('[data-testid=download-button]').click();
        });

      // Verify download
      cy.readFile('cypress/downloads/sample.pdf')
        .should('exist');
    });

    it('should share file', () => {
      // Open share dialog
      cy.get('[data-testid=file-actions]')
        .first()
        .within(() => {
          cy.get('[data-testid=share-button]').click();
        });

      // Enter email to share with
      cy.get('[data-testid=share-email-input]')
        .type('share@example.com');

      // Submit share form
      cy.get('[data-testid=share-submit]').click();

      // Verify success message
      cy.get('[data-testid=share-success-message]')
        .should('be.visible')
        .and('contain', 'File shared successfully');
    });

    it('should delete file', () => {
      // Click delete button
      cy.get('[data-testid=file-actions]')
        .first()
        .within(() => {
          cy.get('[data-testid=delete-button]').click();
        });

      // Confirm deletion
      cy.get('[data-testid=confirm-delete]').click();

      // Verify file removed from list
      cy.get('[data-testid=file-list]')
        .should('not.contain', 'sample.pdf');

      // Verify success message
      cy.get('[data-testid=delete-success-message]')
        .should('be.visible')
        .and('contain', 'File deleted successfully');
    });
  });

  describe('Drag and Drop', () => {
    it('should upload files via drag and drop', () => {
      // Drag file into upload zone
      cy.fixture('sample.pdf').as('sampleFile');
      cy.get('[data-testid=drop-zone]')
        .attachFile('@sampleFile', { subjectType: 'drag-n-drop' });

      // Verify upload success
      cy.get('[data-testid=upload-success-message]')
        .should('be.visible')
        .and('contain', 'File uploaded successfully');
    });
  });

  describe('Storage Quota', () => {
    it('should display storage usage', () => {
      cy.get('[data-testid=storage-usage]')
        .should('exist')
        .and('contain', 'Storage Used');
    });

    it('should warn when approaching quota limit', () => {
      // Upload large files to approach quota
      cy.uploadFileByApi('large1.pdf');
      cy.uploadFileByApi('large2.pdf');

      // Verify warning message
      cy.get('[data-testid=storage-warning]')
        .should('be.visible')
        .and('contain', 'Storage quota almost full');
    });
  });
});
