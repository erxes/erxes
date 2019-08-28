const commonFormParamsDef = `
  $name: String!,
  $brandId: String!,
  $leadId: String!,
  $languageCode: String,
  $leadData: IntegrationLeadData!
`;

const commonFormParams = `
  name: $name,
  brandId: $brandId,
  leadId: $leadId,
  languageCode: $languageCode,
  leadData: $leadData
`;

const commonParamsDef = `
  $formId: String!,
  $themeColor: String,
  $callout: JSON,
  $rules: [InputRule]
`;

const commonParams = `
  formId: $formId,
  themeColor: $themeColor,
  callout: $callout,
  rules: $rules
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
    }
  }
`;

const addLead = `
  mutation leadsAdd(${commonParamsDef}) {
    leadsAdd(${commonParams}) {
      _id
    }
  }
`;

const editLead = `
  mutation leadsEdit($_id: String!, ${commonParamsDef}) {
    leadsEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

export default {
  integrationRemove,
  integrationsEditLeadIntegration,
  integrationsCreateLeadIntegration,
  addLead,
  editLead
};
