import { gql } from '@apollo/client';

export const CMS_TRANSLATIONS = gql`
  query cmsTranslations($objectId: String, $type: String) {
    cmsTranslations(objectId: $objectId, type: $type) {
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
