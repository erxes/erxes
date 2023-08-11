
describe("Contacts", () => {
  beforeEach(() => {
    Cypress.Cookies.debug(true);
      cy.visit('/');
      cy.clearCookies();
      cy.on('uncaught:exception', (err, runnable) => {
          return false
    })
  });

  it("Customer", () => {
    cy.login(Cypress.env('userEmail'), Cypress.env('userPassword'))
    .visit("/contacts/customer");

    cy.waitElm('button[icon="plus-circle"]');
    cy.get('button[icon="plus-circle"]').click();

    const random = Math.random().toString(36).slice(2)

    cy.get('input[name="firstName"]').type(random);

    cy.get("div .Select-placeholder")
      .contains("Enter an email")
      .click()
      .type(random + "@nmma.co");
    cy.waitAndClick("div .Select-menu-outer");

    cy.get('button[type="submit"]')
      .eq(0)
      .click();
    // cy.waitTilDisappear('button[type="submit"]');

    cy.get("#customers")
      .children()
      .eq(0)
      .children()
      .eq(0)
      .click();

    cy.get('button[icon="tag-alt"]').click();

    if(
      cy.get('i[class="icon-tag-alt"]')
      .eq(0)){
        cy.get('i[class="icon-tag-alt"]')
        .eq(0)
        .parent()
        .click();}

    cy.get('button[icon="tag-alt"]').click();
  });
});
