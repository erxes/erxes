const integrations = `
  query integrations {
    integrations {
      _id
      brandId
      languageCode
      name
      kind
      brand {
        _id
        name
        code
      }
      formData
      twitterData
      formId
      tagIds
      tags {
        _id
        colorCode
        name
      }
      form {
        _id
        title
        code
      }
    }
  }
`;

export default {
  integrations
};
