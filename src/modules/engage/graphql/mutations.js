const messagesAdd = `
  mutation messagesAdd($name: String!, $website: String) {
    messagesAdd(name: $name, website: $website) {
      _id
    }
  }
`;

export default {
  messagesAdd
};
