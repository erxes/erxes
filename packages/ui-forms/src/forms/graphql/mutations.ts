
import { commonFields } from './queries';

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


const commonFormParamsDef = `
  $name: String!,
  $brandId: String!,
  $channelIds: [String]
`;

const commonFormParams = `
  name: $name,
  brandId: $brandId,
  channelIds: $channelIds,
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
mutation FormsDuplicate($id: String!) {
  formsDuplicate(_id: $id) {
    _id
  }
}
`;

const formRemove = `
mutation FormsRemove($id: String!) {
  formsRemove(_id: $id)
}`

const formToggleStatus = `
mutation FormsToggleStatus($id: String!) {
  formsToggleStatus(_id: $id) {
    _id
  }
}
`

export default {
  addForm,
  editForm,
  fieldsAdd,
  fieldsEdit,
  fieldsRemove,
  formSubmissionsSave,
  fieldsBulkAction,
  integrationRemove,
  integrationsEditLeadIntegration,
  integrationsCreateLeadIntegration,
  formCopy,
  formRemove,
  formToggleStatus
};
