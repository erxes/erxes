const fields = `
      _id
      name
      description
      site {
        name
        domain
      }
      createdUser {
        details {
          fullName
        }
      }

      updatedUser {
        details {
          fullName
        }
      }
`;

const pagesMain = `
  query pagesMain($page: Int, $perPage: Int, $searchValue: String, $siteId: String) {
    digitalIncomeRoomPagesMain(page: $page, perPage: $perPage, searchValue: $searchValue, siteId: $siteId) {
      list {
        ${fields}
        html
        css
      }
      totalCount
    }
  }
`;

const pageDetail = `
  query pageDetail($_id: String!) {
    digitalIncomeRoomPageDetail(_id: $_id) {
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
    digitalIncomeRoomContentTypes(siteId: $siteId) {
      _id
      displayName
      fields
    }
  }
`;

const contentTypesMain = `
  query contentTypesMain($page: Int, $perPage: Int, $siteId: String) {
    digitalIncomeRoomContentTypesMain(page: $page, perPage: $perPage, siteId: $siteId) {
      list {
        ${typeFields}
      }
      totalCount
    }
  }
`;

const contentTypeDetail = `
  query contentTypeDetail($_id: String!) {
    digitalIncomeRoomContentTypeDetail(_id: $_id) {
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
    digitalIncomeRoomEntriesMain(contentTypeId: $contentTypeId page: $page perPage: $perPage) {
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
    digitalIncomeRoomEntryDetail(_id: $_id) {
      _id
      contentTypeId
      values
    }
  }
`;

const templates = `
  query templates($page: Int, $perPage: Int, $searchValue: String) {
    digitalIncomeRoomTemplates(page: $page, perPage: $perPage, searchValue: $searchValue) {
      _id
      name
      html
      image
      categories
    } 
  }
`;

const templatesTotalCount = `
  query templatesCount {
    digitalIncomeRoomTemplatesTotalCount
  }
`;

const templateDetail = `
  query templateDetail($_id: String!) {
    digitalIncomeRoomTemplateDetail(_id: $_id) {
      _id
      name
    }
  }
`;

const sites = `
  query sites($page: Int, $perPage: Int, $searchValue: String, $fromSelect: Boolean) {
    digitalIncomeRoomSites(page: $page, perPage: $perPage, searchValue: $searchValue, fromSelect: $fromSelect) {
      _id
      name
      domain
      coverImage {
        url
      }
    }
  }
`;

const sitesTotalCount = `
  query sitesTotalCount {
    digitalIncomeRoomSitesTotalCount
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
