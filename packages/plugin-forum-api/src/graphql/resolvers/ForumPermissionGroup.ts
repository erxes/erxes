import { IContext } from '..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import { ICategory } from '../../db/models/category';
import { buildPostsQuery } from './Query/postQueries';

/*
    _id: ID!
    name: String!
    
 users: [ClientPortalUser]

 permissionGroupCategoryPermits: [ForumPermissionGroupCategoryPermit!]
 */

const ForumPermissionGroup: IObjectTypeResolver<ICategory, IContext> = {
  async users({ _id }, _, { models: { PermissionGroupUser } }) {
    const users = await PermissionGroupUser.find({ permissionGroupId: _id });
    return users.map(u => ({ __typename: 'ClientPortalUser ', _id: u.userId }));
  },

  async permissionGroupCategoryPermits(
    { _id },
    _,
    { models: { PermissionGroupCategoryPermit } }
  ) {
    return await PermissionGroupCategoryPermit.find({ categoryId: _id });
  }
};

export default ForumPermissionGroup;
