import { commonFields } from './queries';

const commonFormParamsDef = `
  $name: String!,
  $brandId: String!,
  $formId: String!,
  $languageCode: String,
  $leadData: IntegrationLeadData!
`;

const commonFormParams = `
  name: $name,
  brandId: $brandId,
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

export default {
  integrationRemove,
  integrationsEditLeadIntegration,
  integrationsCreateLeadIntegration
};
