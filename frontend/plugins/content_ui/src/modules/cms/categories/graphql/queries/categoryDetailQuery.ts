import { gql } from '@apollo/client';

export const CMS_CATEGORY_DETAIL = gql`
  query CmsCategoryDetail($_id: String!, $clientPortalId: String) {
    cmsCategory(_id: $_id, clientPortalId: $clientPortalId) {
      _id
      clientPortalId
      createdAt
      description
      name
      slug
      status
      customFieldsData
      translations {
        language
        title
        content
      }
      parent {
        _id
        clientPortalId
        name
        slug
        description
        parentId
        status
        parent {
          _id
          clientPortalId
          name
          slug
          description
          parentId
          status
          parent {
            _id
            clientPortalId
            name
            slug
            description
            parentId
            status
            createdAt
            updatedAt
            customFieldsData
            customFieldsMap
          }
          createdAt
          updatedAt
          customFieldsData
          customFieldsMap
        }
        createdAt
        updatedAt
        customFieldsData
        customFieldsMap
      }
      parentId
      __typename
    }
  }
`;
