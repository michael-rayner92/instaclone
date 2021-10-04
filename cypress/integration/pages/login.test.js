describe('Login', () => {
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
  });

  it('inputs the email address and password and submits the form', () => {
    cy.get('button').should('be.disabled', 'Login');

    cy.get('form').within(() => {
      cy.get('input:first')
        .should('have.attr', 'placeholder', 'Email address')
        .type('michael@genspeakapp.com');
      cy.get('input:last').should('have.attr', 'placeholder', 'Password').type('test123');

      cy.get('button').should('not.be.disabled', 'Login');
      cy.get('button').should('contain.text', 'Login').click();
    });
  });

  it('inputs the email address and password and submits the form with the wrong info', () => {
    cy.get('form').within(() => {
      cy.get('button').should('be.disabled', 'Login');

      cy.get('input:first')
        .should('have.attr', 'placeholder', 'Email address')
        .type('michael@genspeakapp.com');

      cy.get('input:last')
        .should('have.attr', 'placeholder', 'Password')
        .type('testBadPassword123');

      cy.get('button').should('not.be.disabled', 'Login');
      cy.get('button').should('contain.text', 'Login').click();
    });

    cy.get('body').within(() => {
      cy.get('p').should(
        'contain.text',
        'The password is invalid or the user does not have a password.'
      );
    });
  });

  it('navigates to the sign up page and back again', () => {
    cy.get('[data-testid="sign-up-link"]').click();
    cy.get('body').within(() => {
      cy.get('div').should('contain.text', 'Already have an account? Log In');
    });

    cy.get('[data-testid="login-link"]').click();
    cy.get('body').within(() => {
      cy.get('div').should('contain.text', "Don't have an account? Sign Up");
    });
  });
});
