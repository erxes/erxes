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
  query pagesMain($page: Int, $perPage: Int, $searchValue: String, $siteId: String) {
    webbuilderPagesMain(page: $page, perPage: $perPage, searchValue: $searchValue, siteId: $siteId) {
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
      siteId
    }
  }
`;

const typeFields = `
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
`;

const contentTypes = `
  query contentTypes($siteId: String) {
    webbuilderContentTypes(siteId: $siteId) {
      _id
      displayName
    }
  }
`;

const contentTypesMain = `
  query contentTypesMain($page: Int, $perPage: Int, $siteId: String) {
    webbuilderContentTypesMain(page: $page, perPage: $perPage, siteId: $siteId) {
      list {
        ${typeFields}
      }
      totalCount
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
      siteId
    }
  } 
`;

const entriesMain = `
  query entriesMain($contentTypeId: String! $page: Int $perPage: Int) {
    webbuilderEntriesMain(contentTypeId: $contentTypeId page: $page perPage: $perPage) {
      list {
        _id
        contentTypeId
        values
      }
      totalCount
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
  query templates($page: Int, $perPage: Int) {
    webbuilderTemplates(page: $page, perPage: $perPage) {
      _id
      name
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
    }
  }
`;

const sites = `
  query sites($page: Int, $perPage: Int, $fromSelect: Boolean) {
    webbuilderSites(page: $page, perPage: $perPage, fromSelect: $fromSelect) {
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
  contentTypesMain,
  contentTypeDetail,
  entriesMain,
  entryDetail,
  templates,
  templatesTotalCount,
  templateDetail,
  sites,
  sitesTotalCount
};
