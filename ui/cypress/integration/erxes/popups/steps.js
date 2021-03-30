import { SignIn, fakeName } from "../utils";

SignIn;

context("Popups", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Popup steps", () => {
    cy.signIn();

    const randomm = fakeName(3);

    cy.get("#navigation")
      .children()
      .eq(4)
      .click();

    cy.get('button[icon="plus-circle"]').click();
    cy.get('i[icon="comment-1"]').click();
    cy.get('i[icon="window"]').click();

    cy.get('i[icon="focus"]').click();
    cy.get('i[icon="arrow-from-top"]').click();
    cy.get('i[icon="arrow-from-right"]').click();
    cy.get('i[icon="left-arrow-from-left"]').click();

    const title = randomm;

    cy.get("button[icon=arrow-right]")
      .eq(0)
      .click();

    cy.get("#callout-title").type(randomm);

    cy.get("#callout-body").type(randomm);

    cy.get("#callout-btn-text").type(randomm);

    cy.get("button[icon=arrow-right]")
      .eq(1)
      .click();

    cy.get('input[name="title"]').type(randomm);
    cy.get('textarea[name="desc"]').type(randomm);
    cy.get('input[name="btnText"]').type(randomm);

    cy.get('i[icon="edit-alt"]').click();

    addField();

    cy.get('i[icon="paragraph"]').click();
    addField();

    cy.get("button[icon=arrow-right]")
      .eq(2)
      .click();

    cy.get("select").eq(2);

    cy.get("button[icon=arrow-right]")
      .eq(3)
      .click();

    cy.get('button[icon="plus-circle"]').eq(1).click();
    cy.get('input[name="name"]').type(randomm);
    cy.get('textarea[name="description"]').type(randomm);
    cy.get('.modal-body button[icon="check-circle"]').click();

    cy.get('input[id="popupName"]').type('popup name')
    cy.get('select[name="brandId"]').select(randomm);

    cy.get('select[id="languageCode"]').select("English");

    cy.get("button[icon=arrow-right]")
      .eq(4)
      .click();

    cy.get('select[id="successAction"]').select("redirect");
    cy.get('input[id="redirectUrl"]').type(randomm);

    cy.get("ul")
      .eq(1)
      .click();

    cy.get('i[icon="mobile-android"]').click();

    cy.get('button[icon="check-circle"]').click();
  });
});

const randomm = fakeName(5);

function addField() {
  if (cy.get('i[icon="paragraph"]')) {
    cy.get("#FieldLabel").type(randomm);
    cy.get("#FieldDescription").type(randomm);
    cy.get('.modal-footer > button[icon="plus-circle"]').click();
  } else {
    cy.get("#validation").select("Email");
    cy.get("#FieldLabel").type(randomm);
    cy.get("#FieldDescription").type(randomm);
    cy.get('.modal-footer > button[icon="plus-circle"]').click();
  }

}
