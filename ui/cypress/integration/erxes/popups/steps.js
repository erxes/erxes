import { fakeName } from "../utils";

const { eq } = require("lodash");

context("Login", () => {
  beforeEach(() => {
    Cypress.Cookies.debug(true);
    cy.visit("/");
    cy.clearCookies();
  });

  it("Sign In", () => {
    const email = Cypress.env("userEmail");
    const password = Cypress.env("userPassword");

    cy.get("input[name=email]").type(email);
    cy.get("input[name=password]").type(`${password}{enter}`);

    cy.url().should("include", "/inbox");
    cy.getCookie("auth-token").should("exist");

    cy.get("title").should("contain", "Conversation");

    cy.get('button[id="robot-get-started"]').click();

    cy.get('div[id="robot-features"]')
      .children()
      .should("have.length", 9);
    cy.get('button[id="robot-get-started"]').should("be.disabled");

    cy.get('div[id="robot-item-inbox"]').click();
    cy.get('div[id="robot-item-contacts"]').click();
    cy.get('div[id="robot-item-integrations"]').click();

    cy.get('button[id="robot-get-started"]').click();
    cy.get('div[id="robot-feature-close"]').click();

    //  pop ups
    cy.get("#navigation")
      .children()
      .eq(4)
      .click();

    //create pop ups

    cy.get('button[icon="plus-circle"]').click();
    cy.get('i[icon="comment-1"]').click();
    cy.get('i[icon="window"]').click();

    cy.get('i[icon="focus"]').click();
    cy.get('i[icon="arrow-from-top"]').click();
    cy.get('i[icon="arrow-from-right"]').click();
    cy.get('i[icon="left-arrow-from-left"]').click();

    // pop ups title

    cy.get("#CreatePopupsTitle")
      .children()
      .eq(1)
      .type("PopUps");

    // Type next

    //father
    cy.get("#CreatePopupsFather")
      .children()
      .eq(1)
      .children()
      .eq(0)
      .children()
      .children()
      .eq(0)
      .children()
      .eq(1)
      .click();

    // call out

    cy.get("#callout-title").type(" 123");

    cy.get("#callout-body").type("Erxes");

    cy.get("#callout-btn-text").type("12345");

    // cy.get('i[icon="plus"]').click();

    //next button
    cy.get("#CreatePopupsFather")
      .children()
      .eq(1)
      .children()
      .eq(1)
      .children()
      .children()
      .eq(0)
      .children()
      .eq(1)
      .click();

    //form

    cy.get('input[name="title"]').type("Erxes");
    cy.get('textarea[name="desc"]').type("Erxes is open source software");
    cy.get('input[name="btnText"]').type(" Erxes");

    //new field
    //text input
    cy.get('i[icon="edit-alt"]').click();

    cy.get("#validation").select("Email");

    cy.get("#ModalBody")
      .children()
      .children()
      .children()
      .eq(1)
      .type("Hello");

    cy.get("#ModalBody")
      .children()
      .children()
      .children()
      .eq(2)
      .type("Hello Erxes");

    cy.get("#ModalBody")
      .children()
      .children()
      .children()
      .eq(3)
      .children()
      .eq(1)
      .click();

    cy.get("#ModalBody")
      .children()
      .children()
      .children()
      .eq(5)
      .type("Hello");

    cy.get("#ModalBody")
      .children()
      .children()
      .children()
      .eq(4)
      .children()
      .eq(1)
      .click();

    //text area

    cy.get('i[icon="paragraph"]').click();
    cy.get("#validation").select("Email");

    cy.get("#ModalBody")
      .children()
      .children()
      .children()
      .eq(1)
      .type("Hello");

    cy.get("#ModalBody")
      .children()
      .children()
      .children()
      .eq(2)
      .type("Hello Erxes");

    cy.get("#ModalBody")
      .children()
      .children()
      .children()
      .eq(3)
      .children()
      .eq(1)
      .click();

    cy.get("#ModalBody")
      .children()
      .children()
      .children()
      .eq(5)
      .type("Hello");

    cy.get("#ModalBody")
      .children()
      .children()
      .children()
      .eq(4)
      .children()
      .eq(1)
      .click();

    // next

    cy.get("#CreatePopupsFather")
      .children()
      .eq(1)
      .children()
      .eq(2)
      .children()
      .children()
      .eq(0)
      .children()
      .eq(1)
      .click();

    //rule
    // zasvar heregtei !!!!!
    cy.get("#CreatePopupsFather")
      .children()
      .eq(1)
      .children()
      .eq(3)
      .children()
      .children()
      .children()
      .children()
      .children()
      .children()
      .click();

    // next to Options

    cy.get("#CreatePopupsFather")
      .children()
      .eq(1)
      .children()
      .eq(3)
      .children()
      .children()
      .eq(0)
      .children()
      .eq(1)
      .click();

    //brand
    cy.get('select[name="brandId"]').select("Tesla");

    //create brand
    cy.get('i[icon="plus-circle"]').click();

    cy.get('input[name="name"]').type("Nissan");

    cy.get('textarea[name="description"]').type("Fast, safe");
    cy.get('button[icon="check-circle"]').click();

    //language
    cy.get('select[id="languageCode"]').select("English");

    //change color
    cy.get('div[style="background-color: rgb(244, 115, 115);"]').click();

    // next to thank content

    cy.get("#CreatePopupsFather")
      .children()
      .eq(1)
      .children()
      .eq(4)
      .children()
      .children()
      .eq(0)
      .children()
      .eq(1)
      .click();

    // on success

    cy.get('select[id="successAction"]').select("redirect");
    cy.get('input[id="redirectUrl"]').type("redirect 123");

    //next to Full preview

    cy.get("#CreatePopupsFather")
      .children()
      .eq(1)
      .children()
      .eq(5)
      .children()
      .children()
      .eq(0)
      .children()
      .eq(1)
      .click();

    //change tablet

    ul();

    cy.get('i[icon="tablet"]').click();

    ul();

    cy.get('i[icon="mobile-android"]').click();

    ul();

    cy.get('button[icon="checked-1"]').click();
  });
});

function ul() {
  //ul form

  cy.get("#CreatePopupsFather")
    .children()
    .eq(1)
    .children()
    .eq(6)
    .children()
    .children()
    .children()
    .children()
    .children()
    .children()
    .eq(5)
    .click();

  // ul success
  cy.get("#CreatePopupsFather")
    .children()
    .eq(1)
    .children()
    .eq(6)
    .children()
    .children()
    .children()
    .children()
    .children()
    .children()
    .eq(6)
    .click();
}
