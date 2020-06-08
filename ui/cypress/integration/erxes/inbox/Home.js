import { Login } from '../auth/SignIn'
describe('The Home Page', () => {
  beforeEach(() => {
    Login
  })

  it('successfully loads', () => {
    cy.get('title').should('contain', 'Conversation');
    // cy.get('div[id="btn-inbox-channel-visible"]').click();
    cy.get('div[aria-describedby="tags-popover"]').click();
  });
});
