import { gql } from '~/gql';

export const FORM_CONVERSION_CHECK = gql(`
  query frontlineFormFieldConversionCheck(
    $formId: String!
    $fieldId: String!
    $expectedType: String!
    $targetType: String!
    $validator: FieldValidatorInput
    $draftFields: [FrontlineFieldItem!]!
    $page: Int
    $search: String
  ) {
    frontlineFormFieldConversionCheck(
      formId: $formId
      fieldId: $fieldId
      expectedType: $expectedType
      targetType: $targetType
      validator: $validator
      draftFields: $draftFields
      page: $page
      search: $search
    ) {
      checkedCount
      invalidCount
      matchingCount
      hasMore
      examples {
        id
        submissionId
        submittedAt
        value
        reason
      }
    }
  }
`);
