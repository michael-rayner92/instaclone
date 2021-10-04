describe('Profile', () => {
  describe('non-logged in actions', () => {
    beforeEach(() => {
      cy.visit(`${Cypress.config().baseUrl}/p/raphael`);
    });

    it('goes to a profile page and validates the UI', () => {
      cy.get('body').within(() => {
        cy.get('div').should('contain.text', 'raphael');
        cy.get('div').should('contain.text', 'Raffaello Sanzio da Urbino');
        cy.get('div').should('contain.text', '5 photos');
        cy.get('div').should('contain.text', '0 following');
        cy.get('div').contains(/\d followers/);
      });
    });
  });

  describe('logged in user actions', () => {
    beforeEach(() => {
      cy.visit(`${Cypress.config().baseUrl}/login`);
      cy.get('body').within(() => {
        cy.get('div').should('contain.text', "Don't have an account? Sign Up");
      });

      cy.get('div')
        .find('img')
        .should('be.visible')
        .should('have.attr', 'alt')
        .should('contain', 'iPhone with Instagram');

      // Log User In
      cy.get('form').within(() => {
        cy.get('input:first')
          .should('have.attr', 'placeholder', 'Email address')
          .type('michael@genspeakapp.com');
        cy.get('input:last').should('have.attr', 'placeholder', 'Password').type('test123');

        cy.get('button').should('not.be.disabled', 'Login');
        cy.get('button').should('contain.text', 'Login').click();
      });
    });

    it('logs a user in and goes to a profile page and follows and unfollows and checks followers is updated', () => {
      cy.visit(`${Cypress.config().baseUrl}/p/raphael`);

      cy.get('body').within(() => {
        cy.get('div').should('contain.text', 'raphael');
      });

      cy.get('body').within(() => {
        cy.get('[data-testid="toggle-follow-btn"]')
          .contains(/(Follow|Unfollow)/i)
          .click();
      });
    });
  });
});
