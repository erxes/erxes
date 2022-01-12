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

const commonFields = `
  _id
  name
  brandId
  languageCode
  isActive
  channels {
    _id
    name
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
  $status: String
`;

const commonParams = `
  channelId: $channelId,
  brandId: $brandId,
  kind: $kind,
  perPage: $perPage,
  page: $page,
  searchValue: $searchValue
  status: $status
`;

const integrations = `
  query integrations(${commonParamsDef}) {
    integrations(${commonParams}) {
      ${commonFields}

      kind
      brand {
        _id
        name
        code
      }
      webhookData
      leadData
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
      healthStatus
    }
  }
`;

const fetchApi = `
  query integrationsFetchApi($path: String!, $params: JSON!) {
    integrationsFetchApi(path: $path, params: $params)
  }
`;

const integrationDetail = `
  query integrationDetail($_id: String!) {
    integrationDetail(_id: $_id) {
      ${commonFields}
      
      messengerData
      uiOptions
      websiteMessengerApps {
        credentials
      }
      knowledgeBaseMessengerApps {
        credentials
      }
      leadMessengerApps {
        credentials
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

const messengerApps = `
  query messengerApps($integrationId: String!) {
    messengerApps(integrationId: $integrationId) {
      websites{
        description
        buttonText
        url
      }
      knowledgebases{
        topicId
      }
      leads{
        formCode
      }
    }
  }
`;

export default {
  fetchApi,
  integrations,
  users,
  integrationDetail,
  integrationTotalCount,
  brands,
  messengerApps
};
