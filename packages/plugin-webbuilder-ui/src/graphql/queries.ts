const fields = `
      _id
      name
      description
      site {
        name
        domain
      }
`;

const pagesMain = `
  query pagesMain($page: Int, $perPage: Int, $searchValue: String) {
    webbuilderPagesMain(page: $page, perPage: $perPage, searchValue: $searchValue) {
      list {
        ${fields}
      }
      totalCount
    }
  }
`;

const pageDetail = `
  query pageDetail($_id: String!) {
    webbuilderPageDetail(_id: $_id) {
      ${fields}
      html
      css
      jsonData
      siteId
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
      site {
        name
        domain
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
      siteId
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
  query templates($page: Int, $perPage: Int) {
    webbuilderTemplates(page: $page, perPage: $perPage) {
      _id
      name
      jsonData
      html
    } 
  }
`;

const templatesTotalCount = `
  query templatesCount {
    webbuilderTemplatesTotalCount
  }
`;

const templateDetail = `
  query templateDetail($_id: String!) {
    webbuilderTemplateDetail(_id: $_id) {
      _id
      name
      jsonData
    }
  }
`;

const sites = `
  query sites($page: Int, $perPage: Int) {
    webbuilderSites(page: $page, perPage: $perPage) {
      _id
      name
      domain
    }
  }
`;

const sitesTotalCount = `
  query sitesTotalCount {
    webbuilderSitesTotalCount
  }
`;

export default {
  pagesMain,
  pageDetail,
  contentTypes,
  contentTypesTotalCount,
  contentTypeDetail,
  entries,
  entryDetail,
  templates,
  templatesTotalCount,
  templateDetail,
  entriesTotalCount,
  sites,
  sitesTotalCount
};
