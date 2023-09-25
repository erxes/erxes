describe("Lead", () => {
  beforeEach(() => {
    cy.exec('yarn run cypress:seedDB').wait(300);
    Cypress.Cookies.debug(true);
    cy.visit('/');
    cy.clearCookies();
    cy.on('uncaught:exception', (err, runnable) => {
        return false
    })
    cy.login(Cypress.env('userEmail'), Cypress.env('userPassword'))
    .visit("/contacts/lead").wait(300);
  });

  it("add1", () => {

    const random = Math.random().toString(36).slice(2)

    cy.get('button[icon="plus-circle"]', {timeout: 300000}).click();

    cy.get('input[name="firstName"]').type(random);

    cy.get("div .Select-placeholder")
      .contains("Enter an email")
      .click()
      .type(random + "@nmma.co");
    cy.waitAndClick("div.Select-menu-outer");

    cy.get('button[type="submit"]')
      .eq(0)
      .click();
    if(cy.get('button[type="submit"]')){
      cy.get('button[class="close"]')
      .click()    
    }
  })

  it("add2", () => {

    const random2 = Math.random().toString(36).slice(2)

    cy.get('button[icon="plus-circle"]',{timeout:300000}).click();

    cy.get('input[name="firstName"]').type(random2);

    cy.get("div .Select-placeholder")
      .contains("Enter an email")
      .click()
      .type(random2 + "@nmma.co");
    cy.waitAndClick("div.Select-menu-outer");

    cy.get('button[type="submit"]')
      .eq(0)
      .click();
    if(cy.get('button[type="submit"]')){
      cy.get('button[class="close"]')
      .click()    
    }
  })

  it("tag", () => {

    cy.get("#customers>.crow",{timeout: 300000})
      .eq(0)
      .get("#customersCheckBox")
      .click();

    cy.get('button[icon="tag-alt"]').click();

    if(cy.get('i[class="icon-tag-alt"]')){
      cy.get('i[class="icon-tag-alt"]')
      .eq(0)
      .parent()
      .click();
    }

    cy.get('button[icon="tag-alt"]').click();

    if(cy.get('button[icon="tag-alt"]')){
      cy.wait(10)
    }
  })

  it("merge", () => {

    cy.get("#customers>.crow",{timeout: 300000})
      .eq(0)
      .within(() => {
        cy.get("input[type='checkbox']")
        .parent()
        .click()
      });

    cy.get("#customers>.crow")
      .eq(1)
      .within(() => {
        cy.get("input[type='checkbox']")
        .parent()
        .click()
      });

    if(cy.get('button[icon="merge"]')){
      cy.get('button[icon="merge"]').click();
    }

    const mergeCustomerForm = cy.get('div[class="modal-body"]');

    mergeCustomerForm.within(() => {
      cy.get("li")
        .eq(0)
        .click();

      cy.get("li")
        .eq(1)
        .click();

      cy.get("li")
        .eq(7)
        .click();

      cy.get("li")
        .eq(8)
        .click();
      cy.get("li")
        .eq(9)
        .click();
    });

    cy.get('button[icon="check-circle"]').click();

    cy.get('a[href="/contacts"]').click();

    cy.get("#customersCheckBox").click();

    cy.get('button[icon="times-circle"]').click();

    cy.get('button[icon="check-circle"]').click();
  });
});
