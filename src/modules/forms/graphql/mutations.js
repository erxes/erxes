const commonFormParamsDef = `
  $name: String!,
  $brandId: String!,
  $formId: String!,
  $languageCode: String,
  $formData: IntegrationFormData!
`;

const commonFormParams = `
  name: $name,
  brandId: $brandId,
  formId: $formId,
  languageCode: $languageCode,
  formData: $formData
`;

const commonParamsDef = `
  $title: String!,
  $description: String,
`;

const commonParams = `
  title: $title,
  description: $description,
`;

const integrationRemove = `
  mutation integrationsRemove($_id: String!) {
    integrationsRemove(_id: $_id)
  }
`;

const integrationsCreateFormIntegration = `
  mutation integrationsCreateFormIntegration(${commonFormParamsDef}) {
    integrationsCreateFormIntegration(${commonFormParams}) {
      _id
    }
  }
`;

const integrationsEditFormIntegration = `
  mutation integrationsEditFormIntegration($_id: String!, ${
    commonFormParamsDef
  }) {
    integrationsEditFormIntegration(_id: $_id, ${commonFormParams}) {
      _id
    }
  }
`;

const addForm = `
  mutation formsAdd(${commonParamsDef}) {
    formsAdd(${commonParams}) {
      _id
    }
  }
`;

const editForm = `
  mutation formsEdit($_id: String!, ${commonParamsDef}) {
    formsEdit(_id: $_id, ${commonParams}) {
      _id
    }
  }
`;

const removeForm = `
  mutation formsRemove($_id: String!) {
    formsRemove(_id: $_id) {
      _id
    }
  }
`;

export default {
  integrationRemove,
  integrationsEditFormIntegration,
  integrationsCreateFormIntegration,
  addForm,
  editForm,
  removeForm
};
