export const fakeName = (length=10) => {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

export const fakeNameCustomer = () => {
  let result = ''
  const names = ["amrjrgl88","amr.77","amra_456","amar123","jargl01","jaagii05","james_king","amarjargal_boss","batbayar_nice77","bat_firet123","bayar123","bayarbat123"]
  result += names[Math.floor(Math.random() * names.length)];
  return result;
}

export const SignIn = Cypress.Commands.add('signIn', () => {
  const email = Cypress.env('userEmail');
  const password = Cypress.env('userPassword');

  cy.get('input[name=email]').type(email);
  cy.get('input[name=password]').type(`${password}{enter}`);

  cy.url().should('include', '/inbox');
  cy.getCookie('auth-token').should('exist');

  cy.wait(3000);
  cy.get('button[id="robot-get-started"]').click();

  cy.get('div[id="robot-features"]')
    .children()
    .should('have.length', 9);
  cy.get('button[id="robot-get-started"]').should('be.disabled');

  cy.get('div[id="robot-item-inbox"]').click();
  cy.get('div[id="robot-item-contacts"]').click();
  cy.get('div[id="robot-item-integrations"]').click();

  cy.get('button[id="robot-get-started"]').click();
  cy.get('div[id="robot-feature-close"]').click();
});

export const IsExistElement = Cypress.Commands.add('isExistElement', selector => {
  cy.get('body').then(($el) => {
    if ($el.has(selector)) {
      return true
    } else {
      return false
    }
  })
});
