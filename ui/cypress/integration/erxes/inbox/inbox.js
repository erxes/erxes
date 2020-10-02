import { SignIn, fakeName } from "../utils";

SignIn;

context("Login", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Sign In", () => {
    cy.signIn();

    sendMessage();

    cy.get("#btn-inbox-channel-visible").click();
    cy.get('i[icon="angle-down"]')
      .eq(2)
      .click();
    cy.get('i[icon="angle-down"]')
      .eq(3)
      .click();

    cy.get("#btn-inbox-channel-visible").click();

    cy.get('button[icon="check-circle"]').click();

    cy.get(":nth-child(2) > .icon-angle-down").click();
    cy.get('a[href="#link"]')
      .eq(2)
      .click();

    cy.get('button[icon="redo"]').click();

    cy.get('a[href="/inbox"]').click();

    tags();

    cy.get("#mask").click();

    cy.get('div[class="RichEditor-editor"]').click();

    cy.get("#conversationAssignTrigger").click();
    cy.get('input[placeholder="Search"]').type("Admin");

    cy.get('li[class="none"]').click();

    cy.wait(1000);

    cy.get("#conversationAssignTrigger").click();

    cy.get('a[href="/inbox/index"]')
      .eq(1)
      .click()
      .then(() => {
        cy.get("#conversationWrapper").scrollTo("top", { duration: 5000 });
      });

    cy.get("#mask").click();
  });
});

const randomm = fakeName();
const sendMessage = () => {
  cy.get("#mask").click();
  cy.get('div[class="RichEditor-editor"]').type(randomm);
  cy.get('button[icon="message"]').click();
};

const tags = () => {
  cy.get("#conversationTags").click();

  cy.get('input[placeholder="Search"]').type("Angry");
  cy.get('i[class="icon icon-tag-alt"]').click();
};
