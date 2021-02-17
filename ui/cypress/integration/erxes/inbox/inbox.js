import { SignIn, fakeName, waitAndClick, waitElm } from "../utils";

SignIn;

context("Inbox", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Conversation", () => {
    cy.signIn();

    for(let i = 0; i < 2; i++){
      sendMessage();
    }

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

    waitAndClick('#conversationTags');

    cy.get('input[placeholder="Search"]').type("Angry");
    cy.get('i[class="icon icon-tag-alt"]').click();

    waitAndClick('div[class="RichEditor-editor"]')

    cy.get("#conversationAssignTrigger").click();
    cy.get('input[placeholder="Search"]').type("Admin");

    cy.get('#assign-popover li').eq(0).click();

    waitAndClick('#conversationAssignTrigger');

    cy.get('a[href="/inbox/index"]')
      .eq(1)
      .click()
      .then(() => {
        waitElm('#conversationWrapper');
        cy.get("#conversationWrapper").scrollTo("top", { duration: 5000 });
      });
  });
});

let randomm = fakeName();

const sendMessage = () => {
  randomm = fakeName(15);

  cy.get('div[class="RichEditor-editor"]').click();
  cy.get('div[class="RichEditor-editor"]').focused().clear();
  cy.get('div[class="RichEditor-editor"]').type(randomm);
  cy.get('button[icon="message"]').click();
};