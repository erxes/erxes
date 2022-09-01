import { isEnabled } from '@erxes/ui/src/utils/core';

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
      ${
        isEnabled('tags')
          ? `
        tags {
          _id
          colorCode
          name
        }
      `
          : ``
      }
      ${
        isEnabled('forms')
          ? `
              form {
                _id
                title
                code
              }
            `
          : ''
      }
      healthStatus
    }
  }
`;

const integrationGetLineWebhookUrl = `
  query integrationGetLineWebhookUrl($id: String!) {
    integrationGetLineWebhookUrl(_id: $id)
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

const integrationsGetConfigs = `
  query integrationsGetConfigs {
    integrationsGetConfigs
  }
`;

const integrationsGetIntegrationDetail = `
  query integrationsGetIntegrationDetail($erxesApiId: String) {
    integrationsGetIntegrationDetail(erxesApiId: $erxesApiId)
  }
`;

const integrationsGetAccounts = `
  query integrationsGetAccounts($kind: String) {
    integrationsGetAccounts(kind: $kind)
  }
`;

const integrationsGetIntegrations = `
  query integrationsGetIntegrations($kind: String) {
    integrationsGetIntegrations(kind: $kind)
  }
`;

const integrationsGetNylasEvents = `
  query integrationsGetNylasEvents($calendarIds: [String] $startTime: Date $endTime: Date) {
    integrationsGetNylasEvents(calendarIds: $calendarIds startTime: $startTime endTime: $endTime)
  }
`;

const integrationsGetTwitterAccount = `
  query integrationsGetTwitterAccount($accountId: String!) {
    integrationsGetTwitterAccount(accountId: $accountId)
  }
`;

const integrationsGetGmailEmail = `
  query integrationsGetGmailEmail($accountId: String!) {
    integrationsGetGmailEmail(accountId: $accountId)
  }
`;

const integrationsGetFbPages = `
  query integrationsGetFbPages($accountId: String!, $kind: String!) {
    integrationsGetFbPages(accountId: $accountId, kind: $kind)
  }
`;

const integrationsVideoCallUsageStatus = `
  query integrationsVideoCallUsageStatus {
    integrationsVideoCallUsageStatus
  }
`;

const integrationsNylasGetCalendars = `
  query integrationsNylasGetCalendars($accountId: String!, $show: Boolean) {
    integrationsNylasGetCalendars(accountId: $accountId, show: $show)
  }
`;

const integrationsNylasGetSchedulePage = `
  query integrationsNylasGetSchedulePage($pageId: String!) {
    integrationsNylasGetSchedulePage(pageId: $pageId)
  }
`;

const integrationsNylasGetSchedulePages = `
  query integrationsNylasGetSchedulePages($accountId: String!) {
    integrationsNylasGetSchedulePages(accountId: $accountId)
  }
`;

const emailTemplates = `
  query emailTemplates($page: Int, $perPage: Int) {
    emailTemplates(page: $page, perPage: $perPage) {
      _id
      name
      content
    }
  }
`;

const templateTotalCount = `
  query emailTemplatesTotalCount {
    emailTemplatesTotalCount
  }
`;

export default {
  users,
  brands,
  messengerApps,
  integrationDetail,
  integrationTotalCount,
  integrations,
  integrationGetLineWebhookUrl,
  integrationsGetConfigs,
  integrationsGetIntegrationDetail,
  emailTemplates,
  templateTotalCount,
  integrationsGetAccounts,
  integrationsGetIntegrations,
  integrationsGetNylasEvents,
  integrationsGetTwitterAccount,
  integrationsGetGmailEmail,
  integrationsGetFbPages,
  integrationsVideoCallUsageStatus,
  integrationsNylasGetCalendars,
  integrationsNylasGetSchedulePage,
  integrationsNylasGetSchedulePages
};
