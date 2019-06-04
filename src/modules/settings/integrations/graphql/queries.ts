const users = `
  query users {
    users {
      _id
      details {
        avatar
        fullName
      }
    }
  }
`;

const brands = `
  query brands {
    brands {
      _id
      name
      code
      description
    }
  }
`;

const integrationDetail = `
  query integrationDetail($_id: String!) {
    integrationDetail(_id: $_id) {
      _id
      name
      brandId
      languageCode
      messengerData
      uiOptions
    }
  }
`;

const integrationTotalCount = `
  query totalIntegrationsCount {
    integrationsTotalCount {
      total
      byKind
    }
  }
`;

const commonParamsDef = `
  $channelId: String,
  $brandId: String,
  $kind: String,
  $perPage: Int,
  $page: Int,
  $searchValue: String
`;

const commonParams = `
  channelId: $channelId,
  brandId: $brandId,
  kind: $kind,
  perPage: $perPage,
  page: $page,
  searchValue: $searchValue
`;

const integrations = `
  query integrations(${commonParamsDef}) {
    integrations(${commonParams}) {
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
      channels {
        _id
        name
      }
    }
  }
`;

const messengerApps = `
  query messengerApps($kind: String) {
    messengerApps(kind: $kind) {
      _id
      kind
      name
      showInInbox
    }
  }
`;

const messengerAppsCount = `
  query messengerAppsCount($kind: String) {
    messengerAppsCount(kind: $kind)
  }
`;

const accounts = `
  query accounts($kind: String) {
    accounts(kind: $kind) {
        _id
        name
        id
        kind
    }
  }
`;

export default {
  accounts,
  users,
  brands,
  integrationDetail,
  integrationTotalCount,
  integrations,
  messengerApps,
  messengerAppsCount
};
