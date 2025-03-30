import { gql } from '@apollo/client';

const PAGE_LIST = gql`
  query PageList($clientPortalId: String!, $page: Int, $perPage: Int) {
    cmsPageList(clientPortalId: $clientPortalId, page: $page, perPage: $perPage) {
      currentPage
      totalPages
      totalCount
      pages {
        _id
        name
        slug
        clientPortalId
        createdAt
        customFieldsData
       
        createdUser {
          _id
          email
          details {
            fullName
            firstName
            lastName
            middleName
            shortName
            avatar
          }
        }
        createdUserId
        updatedAt
      }
    }
  }
`;


const PAGE = gql`
query Page($id: String) {
  cmsPage(_id: $id) {
    _id
    clientPortalId
    name
    type
    slug
    content
    createdAt
    updatedAt
    customFieldsData
    customFieldsMap
    pageItems {
      type
      content
      order
      contentType
      contentTypeId
    }
  }
}
`

export default {
  PAGE,
  PAGE_LIST,
};
