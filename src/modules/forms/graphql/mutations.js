const commonVariables = `
  $type: String,
  $validation: String,
  $text: String,
  $description: String,
  $options: [String],
  $isRequired: Boolean,
  $order: Int
`;

const commonParams = `
  type: $type,
  validation: $validation,
  text: $text,
  description: $description,
  options: $options,
  isRequired: $isRequired,
  order: $order
`;

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

const integrationRemove = `
  mutation integrationsRemove($_id: String!) {
    integrationsRemove(_id: $_id)
  }
`;

const integrationsCreateMessenger = `
  mutation add($name: String!, $brandId: String!) {
    integrationsCreateMessengerIntegration(
      name: $name
      brandId: $brandId
    ) {
      _id
    }
  }
`;

const integrationsEditMessenger = `
  mutation edit($_id: String!, $name: String!, $brandId: String!) {
    integrationsEditMessengerIntegration(
      _id: $_id
      name: $name
      brandId: $brandId
    ) {
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
        ${commonParams}
      ) {
        _id
      }
  }
`;

const fieldsEdit = `
  mutation fieldsEdit($_id: String!, ${commonVariables}) {
    fieldsEdit(_id: $_id, ${commonParams}) {
      _id
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

const fieldsUpdateOrder = `
  mutation fieldsUpdateOrder($orders: [OrderItem]) {
    fieldsUpdateOrder(orders: $orders) {
      _id
    }
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

export default {
  fieldsAdd,
  fieldsEdit,
  fieldsRemove,
  fieldsUpdateOrder,
  integrationRemove,
  integrationsCreateMessenger,
  integrationsEditMessenger,
  integrationsEditFormIntegration,
  integrationsCreateFormIntegration
};
