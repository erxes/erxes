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

const contentTypes = `
  query contentTypes {
    webbuilderContentTypes {
      _id
      code
      displayName
      fields
      entries {
        _id
      }
    }
  }
`;

const contentTypeDetail = `
  query contentTypeDetail($_id: String!) {
    webbuilderContentTypeDetail(_id: $_id) {
      _id
      code
      displayName
      fields
    }
  } 
`;

const entries = `
  query entries($contentTypeId: String!) {
    webbuilderEntries(contentTypeId: $contentTypeId) {
      _id
      contentTypeId
      values
    } 
  }
`;

const entryDetail = `
  query entryDetail($_id: String!) {
    webbuilderEntryDetail(_id: $_id) {
      _id
      contentTypeId
      values
    }
  }
`;

const templates = `
  query templates {
    webbuilderTemplates {
      _id
      name
      jsonData
    } 
  }
`;

export default {
  pages,
  pageDetail,
  contentTypes,
  contentTypeDetail,
  entries,
  entryDetail,
  templates
};
