import { gql } from '@apollo/client';

const PAGE_LIST = gql`
  query PageList($clientPortalId: String!, $page: Int, $perPage: Int) {
    pageList(clientPortalId: $clientPortalId, page: $page, perPage: $perPage) {
      currentPage
      totalPages
      totalCount
      pages {
        _id
        name
        slug
        createdAt
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
  page(_id: $id) {
    _id
    clientPortalId
    name
    type
    slug
    content
    createdAt
    updatedAt
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
