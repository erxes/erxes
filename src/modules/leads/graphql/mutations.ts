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
  $title: String,
  $description: String,
  $buttonText: String,
  $themeColor: String,
  $callout: JSON,
  $rules:[InputRule]
`;

const commonParams = `
  title: $title,
  description: $description,
  buttonText: $buttonText,
  themeColor: $themeColor,
  callout: $callout
  rules: $rules
`;

const commonVariables = `
  $type: String,
  $validation: String,
  $text: String,
  $description: String,
  $options: [String],
  $isRequired: Boolean,
  $order: Int
`;

const commonFieldParams = `
  type: $type,
  validation: $validation,
  text: $text,
  description: $description,
  options: $options,
  isRequired: $isRequired,
  order: $order
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
  mutation integrationsEditFormIntegration($_id: String!, ${commonFormParamsDef}) {
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

const fieldsAdd = `
  mutation fieldsAdd(
    $contentType: String!,
    $contentTypeId: String,
    ${commonVariables}
  ) {
      fieldsAdd(
        contentType: $contentType,
        contentTypeId: $contentTypeId,
        ${commonFieldParams}
      ) {
        _id
        contentTypeId
      }
  }
`;

const fieldsEdit = `
  mutation fieldsEdit($_id: String!, ${commonVariables}) {
    fieldsEdit(_id: $_id, ${commonFieldParams}) {
      _id
      contentTypeId
    }
  }
`;

const fieldsRemove = `
  mutation fieldsRemove($_id: String!) {
    fieldsRemove(_id: $_id) {
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
  fieldsAdd,
  fieldsEdit,
  fieldsRemove
};
