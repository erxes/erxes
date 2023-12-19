import gql from 'graphql-tag';
import Query from './Query';
import Mutation from './Mutation';
import ForumCategory from './ForumCategory';
import ForumPost from './ForumPost';
import ForumComment from './ForumComment';
import { ADMIN_APPROVAL_STATES, POST_STATES } from '../../db/models/post';
import {
  ALL_CP_USER_LEVELS,
  PERMISSIONS,
  READ_CP_USER_LEVELS,
  TIME_DURATION_UNITS,
  USER_TYPES,
  WRITE_CP_USER_LEVELS
} from '../../consts';
import ForumPermissionGroupCategoryPermit from './ForumPermissionGroupCategoryPermit';
import ForumPermissionGroup from './ForumPermissionGroup';
import ForumSubscriptionProduct from './ForumSubscriptionProduct';
import ForumSubscriptionOrder from './ForumSubscriptionOrder';
import { SUBSCRIPTION_ORDER_STATES } from '../../db/models/subscription/subscriptionOrder';
import ForumPage from './ForumPage';
import ForumSavedPost from './ForumSavedPost';
import ForumPollOption from './ForumPollOption';
import ForumUserStatistics from './ForumUserStatistics';
import QuizTypes from './QuizTypes';

const Invoice = `
  extend type Invoice @key(fields: "_id") {
    _id: String @external
  }

`;

const Tag = `
  extend type Tag @key(fields: "_id") {
    _id: String! @external
  }
`;

export default async function genTypeDefs(serviceDiscovery) {
  const isPaymentEnabled = await serviceDiscovery.isEnabled('payment');
  const isTagsEnabled = await serviceDiscovery.isEnabled('tags');

  return gql`
    scalar JSON
    scalar Date

    enum CacheControlScope {
      PUBLIC
      PRIVATE
    }

    directive @cacheControl(
      maxAge: Int
      scope: CacheControlScope
      inheritMaxAge: Boolean
    ) on FIELD_DEFINITION | OBJECT | INTERFACE | UNION

    enum ForumCpUserType {
      customer 
      company
    }

    enum ForumPostState {
      ${POST_STATES.join('\n')}
    }

    enum AdminApprovalState {
      ${ADMIN_APPROVAL_STATES.join('\n')}
    }

    enum ForumUserType {
      ${USER_TYPES.join('\n')}
    }

    enum ForumPermission {
      ${PERMISSIONS.join('\n')}
    }

    enum ForumAllUserLevels {
      ${Object.keys(ALL_CP_USER_LEVELS).join('\n')}
    }

    enum ForumUserLevelsWrite {
      ${Object.keys(WRITE_CP_USER_LEVELS).join('\n')}
    }

    enum ForumUserLevelsRead {
      ${Object.keys(READ_CP_USER_LEVELS).join('\n')}
    }

    enum ForumTimeDurationUnit {
      ${TIME_DURATION_UNITS.join('\n')}
    }

    enum ForumSubscriptionOrderState {
      ${SUBSCRIPTION_ORDER_STATES.join('\n')}
    }

    extend type User @key(fields: "_id") {
      _id: String! @external
    }

    ${isPaymentEnabled ? Invoice : ''}

    ${isTagsEnabled ? Tag : ''}

    extend type Company @key(fields: "_id") {
      _id: String! @external
    }

    extend type ClientPortalUser @key(fields: "_id") {
      _id: String! @external
      forumSubscriptionEndsAfter: Date
      forumIsSubscribed: Boolean!

      forumFollowerCpUsers(limit: Int, offset: Int): [ClientPortalUser!]
      forumFollowerCount: Int!
      forumIsFollowedByCurrentUser: Boolean!

      forumFollowingCpUsers(limit: Int, offset: Int): [ClientPortalUser!]

      forumPermissionGroups: [ForumPermissionGroup!]

      forumCategoriesAllowedToPost: [ForumCategory!]      

      ${isTagsEnabled ? 'forumFollowingTags: [Tag]' : ''}      
    }

    ${ForumCategory}
    ${ForumPost({ isTagsEnabled })}
    ${ForumComment}

    ${ForumPermissionGroup}
    ${ForumPermissionGroupCategoryPermit}

    ${ForumSubscriptionProduct}
    ${ForumSubscriptionOrder({ isPaymentEnabled })}

    ${ForumPage}

    ${ForumSavedPost}
    ${ForumPollOption}

    ${ForumUserStatistics}

    ${QuizTypes}

    ${Query}
    ${Mutation}
  `;
}
