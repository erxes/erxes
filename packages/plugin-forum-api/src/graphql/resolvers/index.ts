import customScalars from '@erxes/api-utils/src/customScalars';
import ForumCategory from './ForumCategory';
import Mutation from './Mutation';
import Query from './Query';
import { IContext } from '..';
import { IResolvers } from '@graphql-tools/utils';
import ForumPost from './ForumPost';
import ForumComment from './ForumComment';
import ClientPortalUser from './ClientPortalUser';
import ForumPermissionGroup from './ForumPermissionGroup';
import ForumPermissionGroupCategoryPermit from './ForumPermissionGroupCategoryPermit';
import ForumSubscriptionOrder from './ForumSubscriptionOrder';

export default async function generateResolvers(
  serviceDiscovery
): Promise<IResolvers<any, IContext>> {
  const resolvers: IResolvers<any, IContext> = {
    ...customScalars,
    Query,
    Mutation,
    ForumCategory,
    ForumPost,
    ForumComment,
    ClientPortalUser,
    ForumPermissionGroup,
    ForumPermissionGroupCategoryPermit,
    ForumSubscriptionOrder
  };

  return resolvers;
}
