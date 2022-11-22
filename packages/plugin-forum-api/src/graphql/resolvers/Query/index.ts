import { IContext } from '../..';
import { IObjectTypeResolver } from '@graphql-tools/utils';
import categoryQueries from './categoryQueries';
import postQueries from './postQueries';
import commentQueries from './commentQueries';
import { ALL_CP_USER_LEVELS } from '../../../consts';
import permissionGroupQueries from './permissionGroupQueries';
import subscriptionProductQueries from './subscriptionProductQueries';
import subscriptionOrderQueries from './subscriptionOrderQueries';
import pageQueries from './pageQueries';

const userLevelQueries: IObjectTypeResolver<any, IContext> = {
  forumUserLevelValues: () => {
    return ALL_CP_USER_LEVELS;
  }
};

const Query: IObjectTypeResolver<any, IContext> = {
  ...categoryQueries,
  ...postQueries,
  ...commentQueries,
  ...userLevelQueries,
  ...permissionGroupQueries,
  ...subscriptionProductQueries,
  ...subscriptionOrderQueries,
  ...pageQueries
};

export default Query;
