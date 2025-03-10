describe('AI Assistant', () => {
  beforeEach(() => {
    // Login as premium user and visit dashboard
    cy.loginByApi('premium@example.com', 'Password123!', 'premium');
    cy.visit('/dashboard');
  });

  describe('Command Processing', () => {
    it('should process file sorting command', () => {
      // Upload test files first
      cy.uploadFileByApi('document1.pdf');
      cy.uploadFileByApi('document2.docx');
      cy.uploadFileByApi('image1.jpg');

      // Type command in AI assistant input
      cy.get('[data-testid=ai-command-input]')
        .type('sort my files by type{enter}');

      // Verify command processing
      cy.get('[data-testid=ai-processing-indicator]')
        .should('be.visible');

      // Verify result
      cy.get('[data-testid=ai-response]')
        .should('contain', 'Files sorted by type');

      // Verify files are sorted
      cy.get('[data-testid=file-list]').within(() => {
        cy.get('[data-testid=file-type]').then($types => {
          const types = $types.map((i, el) => Cypress.$(el).text()).get();
          expect(types).to.deep.equal(['Document', 'Document', 'Image']);
        });
      });
    });

    it('should process email sync command', () => {
      cy.get('[data-testid=ai-command-input]')
        .type('sync my outlook emails{enter}');

      cy.get('[data-testid=ai-processing-indicator]')
        .should('be.visible');

      cy.get('[data-testid=ai-response]')
        .should('contain', 'Emails synchronized successfully');

      // Verify emails appear in inbox
      cy.get('[data-testid=email-list]')
        .should('not.be.empty');
    });

    it('should process calendar update command', () => {
      cy.get('[data-testid=ai-command-input]')
        .type('update my calendar{enter}');

      cy.get('[data-testid=ai-response]')
        .should('contain', 'Calendar updated successfully');

      // Verify calendar events are updated
      cy.get('[data-testid=calendar-events]')
        .should('exist');
    });

    it('should handle natural language variations', () => {
      const commands = [
        'organize my files by date',
        'sort files according to date',
        'arrange files by date',
        'put files in date order'
      ];

      commands.forEach(command => {
        cy.get('[data-testid=ai-command-input]')
          .clear()
          .type(`${command}{enter}`);

        cy.get('[data-testid=ai-response]')
          .should('contain', 'Files sorted by date');
      });
    });
  });

  describe('Command History', () => {
    it('should display command history', () => {
      // Execute multiple commands
      const commands = [
        'sort files by type',
        'sync emails',
        'update calendar'
      ];

      commands.forEach(command => {
        cy.get('[data-testid=ai-command-input]')
          .type(`${command}{enter}`);
        cy.get('[data-testid=ai-processing-indicator]')
          .should('not.exist');
      });

      // Open command history
      cy.get('[data-testid=command-history-button]').click();

      // Verify commands are listed
      cy.get('[data-testid=command-history-list]').within(() => {
        commands.forEach(command => {
          cy.contains(command).should('exist');
        });
      });
    });

    it('should rerun command from history', () => {
      // Execute command first time
      cy.get('[data-testid=ai-command-input]')
        .type('sort files by name{enter}');

      cy.get('[data-testid=ai-processing-indicator]')
        .should('not.exist');

      // Open command history
      cy.get('[data-testid=command-history-button]').click();

      // Click rerun button
      cy.get('[data-testid=command-history-list]')
        .contains('sort files by name')
        .parent()
        .find('[data-testid=rerun-command]')
        .click();

      // Verify command is rerun
      cy.get('[data-testid=ai-processing-indicator]')
        .should('be.visible');
      cy.get('[data-testid=ai-response]')
        .should('contain', 'Files sorted by name');
    });
  });

  describe('Command Suggestions', () => {
    it('should show context-aware suggestions', () => {
      // Click AI assistant input
      cy.get('[data-testid=ai-command-input]').click();

      // Verify suggestions appear
      cy.get('[data-testid=command-suggestions]')
        .should('be.visible')
        .within(() => {
          cy.contains('Sort files').should('exist');
          cy.contains('Sync emails').should('exist');
          cy.contains('Update calendar').should('exist');
        });
    });

    it('should filter suggestions while typing', () => {
      cy.get('[data-testid=ai-command-input]')
        .type('sort');

      cy.get('[data-testid=command-suggestions]')
        .should('contain', 'Sort files by type')
        .and('contain', 'Sort files by date')
        .and('contain', 'Sort files by name')
        .and('not.contain', 'Sync emails');
    });

    it('should use suggestion on click', () => {
      cy.get('[data-testid=ai-command-input]').click();
      
      cy.get('[data-testid=command-suggestions]')
        .contains('Sort files by type')
        .click();

      cy.get('[data-testid=ai-command-input]')
        .should('have.value', 'Sort files by type');
    });
  });

  describe('Error Handling', () => {
    it('should handle unknown commands', () => {
      cy.get('[data-testid=ai-command-input]')
        .type('do something impossible{enter}');

      cy.get('[data-testid=ai-response]')
        .should('contain', 'I don\'t understand that command');
    });

    it('should handle service unavailability', () => {
      // Mock API error
      cy.intercept('POST', '/api/ai/command', {
        statusCode: 503,
        body: { error: 'Service unavailable' }
      });

      cy.get('[data-testid=ai-command-input]')
        .type('sort files{enter}');

      cy.get('[data-testid=error-message]')
        .should('contain', 'Service is temporarily unavailable');
    });

    it('should handle rate limiting', () => {
      // Rapidly execute multiple commands
      for (let i = 0; i < 10; i++) {
        cy.get('[data-testid=ai-command-input]')
          .type(`command ${i}{enter}`);
      }

      cy.get('[data-testid=error-message]')
        .should('contain', 'Too many requests');
    });
  });

  describe('Subscription Features', () => {
    it('should restrict advanced features for basic users', () => {
      // Switch to basic user
      cy.loginByApi('basic@example.com', 'Password123!', 'basic');
      cy.visit('/dashboard');

      cy.get('[data-testid=ai-command-input]')
        .type('analyze my documents{enter}');

      cy.get('[data-testid=upgrade-prompt]')
        .should('be.visible')
        .and('contain', 'Upgrade to Premium');
    });

    it('should allow all features for premium users', () => {
      cy.get('[data-testid=ai-command-input]')
        .type('analyze my documents{enter}');

      cy.get('[data-testid=ai-response]')
        .should('contain', 'Analysis complete');

      cy.get('[data-testid=document-insights]')
        .should('be.visible');
    });
  });
});
