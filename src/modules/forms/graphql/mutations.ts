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
  $title: String,
  $description: String,
  $buttonText: String,
  $type: String!
`;

const commonParams = `
  title: $title,
  description: $description,
  buttonText: $buttonText,
  type: $type
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

const integrationsCreateLeadintegration = `
  mutation integrationsCreateLeadintegration(${commonFormParamsDef}) {
    integrationsCreateLeadintegration(${commonFormParams}) {
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
  integrationsCreateLeadintegration,
  addForm,
  editForm,
  fieldsAdd,
  fieldsEdit,
  fieldsRemove
};
