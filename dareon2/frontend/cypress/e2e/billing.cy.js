describe('Billing and Subscriptions', () => {
  beforeEach(() => {
    cy.loginByApi('test@example.com', 'Password123!');
  });

  describe('Subscription Plans', () => {
    beforeEach(() => {
      cy.visit('/pricing');
    });

    it('should display available subscription plans', () => {
      // Verify plan cards are displayed
      cy.get('[data-testid=plan-cards]').within(() => {
        // Free plan
        cy.get('[data-testid=free-plan]').should('exist').within(() => {
          cy.contains('Free Trial');
          cy.contains('$0');
          cy.contains('14 days');
        });

        // Basic plan
        cy.get('[data-testid=basic-plan]').should('exist').within(() => {
          cy.contains('Basic');
          cy.contains('$9.99');
          cy.contains('/month');
        });

        // Premium plan
        cy.get('[data-testid=premium-plan]').should('exist').within(() => {
          cy.contains('Premium');
          cy.contains('$29.99');
          cy.contains('/month');
        });
      });
    });

    it('should show feature comparison', () => {
      cy.get('[data-testid=feature-comparison]').within(() => {
        // Check feature rows
        cy.contains('Storage Limit').should('exist');
        cy.contains('AI Assistant').should('exist');
        cy.contains('Integration Limit').should('exist');
        cy.contains('Support Level').should('exist');

        // Verify premium features
        cy.get('[data-testid=premium-features]').within(() => {
          cy.contains('100GB Storage');
          cy.contains('Advanced AI');
          cy.contains('Unlimited Integrations');
          cy.contains('24/7 Priority Support');
        });
      });
    });

    it('should highlight recommended plan', () => {
      cy.get('[data-testid=basic-plan]')
        .should('have.class', 'recommended')
        .and('contain', 'Most Popular');
    });
  });

  describe('Subscription Process', () => {
    it('should subscribe to basic plan', () => {
      cy.visit('/pricing');
      
      // Select basic plan
      cy.get('[data-testid=basic-plan]')
        .contains('Select Plan')
        .click();

      // Fill payment form
      cy.get('[data-testid=card-number]').type('4242424242424242');
      cy.get('[data-testid=card-expiry]').type('1225');
      cy.get('[data-testid=card-cvc]').type('123');

      // Submit payment
      cy.get('[data-testid=subscribe-button]').click();

      // Verify success
      cy.get('[data-testid=success-message]')
        .should('contain', 'Successfully subscribed to Basic plan');

      // Verify redirect to dashboard
      cy.url().should('include', '/dashboard');

      // Verify subscription status updated
      cy.get('[data-testid=subscription-status]')
        .should('contain', 'Basic')
        .and('contain', 'Active');
    });

    it('should handle failed payment', () => {
      cy.visit('/pricing');
      
      // Select premium plan
      cy.get('[data-testid=premium-plan]')
        .contains('Select Plan')
        .click();

      // Fill payment form with declined card
      cy.get('[data-testid=card-number]').type('4000000000000002');
      cy.get('[data-testid=card-expiry]').type('1225');
      cy.get('[data-testid=card-cvc]').type('123');

      // Submit payment
      cy.get('[data-testid=subscribe-button]').click();

      // Verify error message
      cy.get('[data-testid=error-message]')
        .should('contain', 'Your card was declined');
    });

    it('should validate payment form', () => {
      cy.visit('/pricing');
      cy.get('[data-testid=basic-plan]')
        .contains('Select Plan')
        .click();

      // Submit empty form
      cy.get('[data-testid=subscribe-button]').click();

      // Verify validation errors
      cy.get('[data-testid=card-number-error]')
        .should('contain', 'Card number is required');
      cy.get('[data-testid=card-expiry-error]')
        .should('contain', 'Expiry date is required');
      cy.get('[data-testid=card-cvc-error]')
        .should('contain', 'CVC is required');
    });
  });

  describe('Plan Management', () => {
    beforeEach(() => {
      cy.visit('/settings/billing');
    });

    it('should upgrade subscription', () => {
      // Start with basic plan
      cy.subscribeByApi('basic');
      cy.reload();

      // Click upgrade button
      cy.get('[data-testid=upgrade-button]').click();

      // Select premium plan
      cy.get('[data-testid=premium-plan]')
        .contains('Select Plan')
        .click();

      // Confirm upgrade
      cy.get('[data-testid=confirm-upgrade]').click();

      // Verify success
      cy.get('[data-testid=success-message]')
        .should('contain', 'Successfully upgraded to Premium plan');

      // Verify subscription updated
      cy.get('[data-testid=subscription-status]')
        .should('contain', 'Premium');
    });

    it('should downgrade subscription', () => {
      // Start with premium plan
      cy.subscribeByApi('premium');
      cy.reload();

      // Click downgrade button
      cy.get('[data-testid=downgrade-button]').click();

      // Select basic plan
      cy.get('[data-testid=basic-plan]')
        .contains('Select Plan')
        .click();

      // Confirm downgrade
      cy.get('[data-testid=confirm-downgrade]').click();

      // Verify success
      cy.get('[data-testid=success-message]')
        .should('contain', 'Successfully downgraded to Basic plan');
    });

    it('should cancel subscription', () => {
      // Start with active subscription
      cy.subscribeByApi('basic');
      cy.reload();

      // Click cancel button
      cy.get('[data-testid=cancel-subscription]').click();

      // Confirm cancellation
      cy.get('[data-testid=confirm-cancel]').click();

      // Verify success
      cy.get('[data-testid=success-message]')
        .should('contain', 'Subscription cancelled successfully');

      // Verify subscription status
      cy.get('[data-testid=subscription-status]')
        .should('contain', 'Cancelled');
    });
  });

  describe('Billing History', () => {
    beforeEach(() => {
      cy.subscribeByApi('basic');
      cy.visit('/settings/billing/history');
    });

    it('should display invoice history', () => {
      cy.get('[data-testid=invoice-list]').within(() => {
        // Check invoice details
        cy.get('[data-testid=invoice-item]').first().within(() => {
          cy.get('[data-testid=invoice-date]').should('exist');
          cy.get('[data-testid=invoice-amount]').should('exist');
          cy.get('[data-testid=invoice-status]').should('contain', 'Paid');
          cy.get('[data-testid=download-invoice]').should('exist');
        });
      });
    });

    it('should download invoice', () => {
      cy.get('[data-testid=invoice-list]')
        .find('[data-testid=download-invoice]')
        .first()
        .click();

      // Verify download
      cy.readFile('cypress/downloads/invoice.pdf')
        .should('exist');
    });
  });

  describe('Payment Methods', () => {
    beforeEach(() => {
      cy.visit('/settings/billing/payment-methods');
    });

    it('should add new payment method', () => {
      cy.get('[data-testid=add-payment-method]').click();

      // Fill card details
      cy.get('[data-testid=card-number]').type('4242424242424242');
      cy.get('[data-testid=card-expiry]').type('1225');
      cy.get('[data-testid=card-cvc]').type('123');

      // Submit
      cy.get('[data-testid=save-card]').click();

      // Verify success
      cy.get('[data-testid=success-message]')
        .should('contain', 'Payment method added successfully');

      // Verify card appears in list
      cy.get('[data-testid=payment-methods]')
        .should('contain', '•••• 4242');
    });

    it('should set default payment method', () => {
      cy.get('[data-testid=payment-methods]')
        .find('[data-testid=set-default]')
        .first()
        .click();

      // Verify success
      cy.get('[data-testid=success-message]')
        .should('contain', 'Default payment method updated');

      // Verify default badge
      cy.get('[data-testid=payment-methods]')
        .find('[data-testid=default-badge]')
        .should('exist');
    });

    it('should remove payment method', () => {
      cy.get('[data-testid=payment-methods]')
        .find('[data-testid=remove-payment-method]')
        .first()
        .click();

      // Confirm removal
      cy.get('[data-testid=confirm-remove]').click();

      // Verify success
      cy.get('[data-testid=success-message]')
        .should('contain', 'Payment method removed successfully');
    });
  });
});
