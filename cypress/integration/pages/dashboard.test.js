describe('Dashboard', () => {
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

    cy.get('div')
      .find('img')
      .should('be.visible')
      .should('have.attr', 'alt')
      .should('contain', 'Instagram');
  });

  it('logs the user in and shows the dashboard and does basic checks around the UI', () => {
    cy.get('body').within(() => {
      cy.get('div').should('contain.text', 'mike'); // username in the sidebar
      cy.get('div').should('contain.text', 'Michael Rayner'); // full name in the sidebar
      cy.get('div').should('contain.text', 'Suggestions for you'); // if te user has suggestions
    });
  });

  it('logs the user in and adds a comment to a photo', () => {
    cy.get('[data-testid="add-comment-NVIqgH4AM0XNpant8Q2L"]')
      .should('have.attr', 'placeholder', 'Add a comment...')
      .type('Yummo!');
    cy.get('[data-testid="add-comment-submit-NVIqgH4AM0XNpant8Q2L"]').submit();
  });

  it('logs the user in and likes a photo', () => {
    cy.get('[data-testid="like-photo-NVIqgH4AM0XNpant8Q2L"]').click();
  });

  it('logs the user in and then signs out', () => {
    cy.get('[data-testid="sign-out"]').click();
    cy.get('div').should('contain.text', "Don't have an account? Sign Up");
  });
});
