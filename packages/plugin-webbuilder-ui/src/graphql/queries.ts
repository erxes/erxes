const fields = `
      _id
      name
      description
`;

const pages = `
  query pages($page: Int, $perPage: Int) {
    webbuilderPages(page: $page, perPage: $perPage) {
      ${fields}
    }
  }
`;

const pagesTotalCount = `
  query pagesTotalCount {
    webbuilderPagesTotalCount
  }
`;

const pageDetail = `
  query pageDetail($_id: String!) {
    webbuilderPageDetail(_id: $_id) {
      ${fields}
      html
      css
      jsonData
    }
  }
`;

const contentTypes = `
  query contentTypes($page: Int $perPage: Int) {
    webbuilderContentTypes(page: $page perPage: $perPage) {
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

const contentTypesTotalCount = `
  query contentTypesTotalCount {
    webbuilderContentTypesTotalCount
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
  query entries($contentTypeId: String! $page: Int $perPage: Int) {
    webbuilderEntries(contentTypeId: $contentTypeId page: $page perPage: $perPage) {
      _id
      contentTypeId
      values
    } 
  }
`;

const entriesTotalCount = `
  query entriesTotalCount($contentTypeId: String!) {
    webbuilderEntriesTotalCount(contentTypeId: $contentTypeId)
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
  pagesTotalCount,
  pageDetail,
  contentTypes,
  contentTypesTotalCount,
  contentTypeDetail,
  entries,
  entryDetail,
  templates,
  entriesTotalCount
};
