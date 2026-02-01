import { gql } from '@apollo/client';

export const GET_FORM_DETAIL = gql`
  query FormDetail($id: String!) {
    formDetail(_id: $id) {
      _id
      name
      title
      code
      type
      description
      buttonText
      numberOfPages
      status
      googleMapApiKey
      fields {
        _id
        contentType
        contentTypeId
        name
        isVisible
        isVisibleInDetail
        canHide
        groupId
        locationOptions {
          lat
          lng
          description
        }
        optionsValues
        subFieldIds
        logics {
          fieldId
          logicOperator
          logicValue
        }
        description
        options
        type
        validation
        regexValidation
        text
        content
        isRequired
        order
        logicAction
        column
        pageNumber
        code
        searchable
        showInCard
        isVisibleToCreate
        productCategoryId
        field
        isDefinedByErxes
        relationType
        isDisabled
      }
      visibility
      leadData
      languageCode
      channelId
      integrationId
    }
  }
`;
