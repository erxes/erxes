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
import ForumSavedPost from './ForumSavedPost';
import ForumPollOption from './ForumPollOption';
import ForumUserStatistics from './ForumUserStatistics';
import ForumQuiz from './ForumQuiz';
import ForumQuizQuestion from './ForumQuizQuestion';
import ForumQuizChoice from './ForumQuizChoice';

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
    ForumSubscriptionOrder,
    ForumSavedPost,
    ForumPollOption,
    ForumUserStatistics,
    ForumQuiz,
    ForumQuizQuestion,
    ForumQuizChoice
  };

  return resolvers;
}
