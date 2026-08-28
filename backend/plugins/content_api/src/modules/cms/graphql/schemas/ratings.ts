import { GQL_CURSOR_PARAM_DEFS } from 'erxes-api-shared/utils';

export const types = `
  enum PostRatingStatus {
    pending
    approved
    rejected
  }

  type PostRating {
    _id: String!
    postId: String!
    clientPortalId: String!
    authorId: String!
    rating: Int!
    status: PostRatingStatus!
    createdAt: Date
    updatedAt: Date
  }

  type PostRatingBucket {
    rating: Int!
    count: Int!
  }

  type PostRatingSummary {
    averageRating: Float!
    totalCount: Int!
    distribution: [PostRatingBucket!]!
  }

  type PostRatingOverview {
    enabled: Boolean!
    summary: PostRatingSummary!
    myRating: PostRating
  }

  type PostRatingList {
    ratings: [PostRating!]!
    totalCount: Int!
    pageInfo: PageInfo
    approvedSummary: PostRatingSummary!
  }
`;

export const queries = `
  cmsPostRatings(
    clientPortalId: String!
    postId: String!
    ${GQL_CURSOR_PARAM_DEFS}
  ): PostRatingList
  cpPostRatingOverview(postId: String!): PostRatingOverview
`;

export const mutations = `
  cmsPostRatingChangeStatus(_id: String!, status: PostRatingStatus!): PostRating
  cmsPostRatingDelete(_id: String!): JSON
  cpPostRatingSet(postId: String!, rating: Int!): PostRatingOverview
  cpPostRatingDelete(postId: String!): PostRatingOverview
`;
