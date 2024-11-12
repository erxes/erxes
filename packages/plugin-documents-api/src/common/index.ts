import contacts from "./contacts";
import products from "./products";
import users from "./users";

export default {
  types: [...users.types, ...products.types, ...contacts.types],
  editorAttributes: {
    user: users.editorAttributes,
    product: products.editorAttributes,
    customer: contacts.editorAttributes,
    company: contacts.editorAttributes
  },
  replaceContent: {
    user: users.replaceContent,
    product: products.replaceContent,
    customer: contacts.replaceContactContent,
    company: contacts.replaceContactContent
  }
};
