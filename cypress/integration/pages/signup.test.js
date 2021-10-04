describe('Sign Up', () => {
  beforeEach(() => {
    cy.visit(`${Cypress.config().baseUrl}/sign-up`);
    cy.get('body').within(() => {
      cy.get('div').should('contain.text', 'Already have an account? Log In');
    });

    cy.get('div')
      .find('img')
      .should('be.visible')
      .should('have.attr', 'alt')
      .should('contain', 'iPhone with Instagram');
  });

  it('inputs the form values and submits the form', () => {
    cy.get('button').should('be.disabled', 'Sign Up');
    cy.get('form').within(() => {
      cy.get('input[name=username]').should('have.attr', 'placeholder', 'Username').type('mike');
      cy.get('input[name=fullName]')
        .should('have.attr', 'placeholder', 'Full name')
        .type('Michael Rayner');
      cy.get('input[name=emailAddress]')
        .should('have.attr', 'placeholder', 'Email address')
        .type('michael2@genspeakapp.com');
      cy.get('input[name=password]').should('have.attr', 'placeholder', 'Password').type('test123');

      cy.get('button').should('not.be.disabled', 'Sign Up');
      cy.get('button').should('contain.text', 'Sign Up').click();
    });
  });
});
