import { commonFields } from './queries';

const commonFormParamsDef = `
  $name: String!,
  $brandId: String!,
  $channelIds: [String]
  $formId: String!,
  $languageCode: String,
  $leadData: IntegrationLeadData!
`;

const commonFormParams = `
  name: $name,
  brandId: $brandId,
  channelIds: $channelIds,
  formId: $formId,
  languageCode: $languageCode,
  leadData: $leadData
`;

const integrationRemove = `
  mutation integrationsRemove($_id: String!) {
    integrationsRemove(_id: $_id)
  }
`;

const integrationsCreateLeadIntegration = `
  mutation integrationsCreateLeadIntegration(${commonFormParamsDef}) {
    integrationsCreateLeadIntegration(${commonFormParams}) {
      _id
    }
  }
`;

const integrationsEditLeadIntegration = `
  mutation integrationsEditLeadIntegration($_id: String!, ${commonFormParamsDef}) {
    integrationsEditLeadIntegration(_id: $_id, ${commonFormParams}) {
      _id
      ${commonFields}
    }
  }
`;

const formCopy = `
  mutation integrationsCopyLeadIntegration($_id: String!) {
    integrationsCopyLeadIntegration(_id: $_id) {
      _id
    }
  }
`;

export default {
  integrationRemove,
  integrationsEditLeadIntegration,
  integrationsCreateLeadIntegration,
  formCopy
};
