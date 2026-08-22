import { gql } from '@apollo/client';

const RATING_FIELDS = `
  _id
  postId
  clientPortalId
  authorId
  rating
  status
  createdAt
  updatedAt
  __typename
`;

export const CMS_POST_RATING_CHANGE_STATUS = gql`
  mutation CmsPostRatingChangeStatus(
    $_id: String!
    $status: PostRatingStatus!
  ) {
    cmsPostRatingChangeStatus(_id: $_id, status: $status) {
      ${RATING_FIELDS}
    }
  }
`;

export const CMS_POST_RATING_DELETE = gql`
  mutation CmsPostRatingDelete($_id: String!) {
    cmsPostRatingDelete(_id: $_id)
  }
`;
