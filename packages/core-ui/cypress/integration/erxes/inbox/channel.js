import { SignIn, waitTilDisappear } from "../utils";

SignIn;

context("Channels", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Channels", () => {
    cy.signIn();
    cy.visit("/settings/channels");

    cy.contains("button","Add New Channel").click();
    cy.get("input[name=name]").click().type('new test channel');
    cy.get("textarea[name=description]").click().type("new test channel description");
    cy.get('div[class=" css-13cymwt-control"]').click();
    cy.get('div[class=" css-1nmdiq5-menu"]').children().eq(0).click();
    cy.get("button[type=submit]").click();


  });
});