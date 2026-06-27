import { gql } from '@apollo/client';

export const CMS_ADD_TRANSLATION = gql`
  mutation cmsAddTranslation($input: TranslationInput!) {
    cmsAddTranslation(input: $input) {
      _id
      objectId
      language
      title
      content
      excerpt
      customFieldsData
      type
    }
  }
`;

export const CMS_EDIT_TRANSLATION = gql`
  mutation cmsEditTranslation($input: TranslationInput!) {
    cmsEditTranslation(input: $input) {
      _id
      objectId
      language
      title
      content
      excerpt
      customFieldsData
      type
    }
  }
`;
