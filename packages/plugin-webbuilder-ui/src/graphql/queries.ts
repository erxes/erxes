const fields = `
      _id
      name
      description
      html
      css
      jsonData
`;

const pages = `
  query pages {
    webbuilderPages {
      ${fields}
    }
  }
`;

const pageDetail = `
  query pageDetail($_id: String!) {
    webbuilderPageDetail(_id: $_id) {
      ${fields}
    }
  }
`;

export default {
  pages,
  pageDetail
};
