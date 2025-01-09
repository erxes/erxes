const commonParamsDef = `
  $type: String!
  $name: String!
  $title: String
  $description: String
  $buttonText: String
  $numberOfPages: Int
  $visibility: String
  $leadData: JSON
  $languageCode: String
  $departmentIds: [String]
  $tagIds: [String]
  $brandId: String
  $integrationId: String
`;

const commonParams = `
  name: $name
  type: $type
    title: $title
    description: $description
    buttonText: $buttonText
    numberOfPages: $numberOfPages
    visibility: $visibility
    leadData: $leadData
    languageCode: $languageCode
    departmentIds: $departmentIds
    tagIds: $tagIds
    brandId: $brandId
    integrationId: $integrationId
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

const commonFieldParamsDef = `
  $type: String,
  $validation: String,
  $regexValidation: String,
  $text: String,
  $description: String,
  $options: [String],
  $isRequired: Boolean,
  $order: Int
  $associatedFieldId: String
`;

const commonFieldParams = `
  type: $type,
  validation: $validation,
  regexValidation: $regexValidation,
  text: $text,
  description: $description,
  options: $options,
  isRequired: $isRequired,
  order: $order
  associatedFieldId: $associatedFieldId
`;

const fieldsAdd = `
  mutation fieldsAdd(
    $contentType: String!,
    $contentTypeId: String,
    ${commonFieldParamsDef}
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
  mutation fieldsEdit($_id: String!, ${commonFieldParamsDef}) {
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

const commonFormSubmissionParamsDef = `
  $formId: String,
  $contentType: String,
  $contentTypeId: String,
  $formSubmissions: JSON,
`;

const commonFormSubmissionParams = `
  formId: $formId,
  contentType: $contentType,
  contentTypeId: $contentTypeId,
  formSubmissions: $formSubmissions
`;

const formSubmissionsSave = `
  mutation formSubmissionsSave(${commonFormSubmissionParamsDef}) {
    formSubmissionsSave(${commonFormSubmissionParams})
  }
`;

const fieldsBulkAction = `
  mutation fieldsBulkAction(
    $contentType: String!,
    $contentTypeId: String,
    $newFields: [FieldItem],
    $updatedFields: [FieldItem]
  ) {
      fieldsBulkAction(
        contentType: $contentType,
        contentTypeId: $contentTypeId,
        newFields: $newFields,
        updatedFields: $updatedFields
      ) {
        _id
        contentTypeId
      }
  }
`;

export default {
  addForm,
  editForm,
  fieldsAdd,
  fieldsEdit,
  fieldsRemove,
  formSubmissionsSave,
  fieldsBulkAction
};
