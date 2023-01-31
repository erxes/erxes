import { createGenerateModels } from '@erxes/api-utils/src/core';

import { Connection } from 'mongoose';
import { generateCategoryModel, ICategoryModel } from './category';
import { generateCommentModel, ICommentModel } from './comment';
import {
  generateForumClientPortalUserModel,
  IForumClientPortalUserModel
} from './forumClientPortalUser';
import { generateFollowCpUserModel, IFollowCpUserModel } from './followCpUser';
import { generatePostModel, IPostModel } from './post';
import { generateUserGroupModels } from './permissionGroupModels';
import { generateVoteModels, VoteModel } from './vote';
import { IPermissionGroupModel } from './permissionGroupModels/permissionGroup';
import { IPermissionGroupUserModel } from './permissionGroupModels/permissionGroupUser';
import { IPermissionGroupCategoryPermitModel } from './permissionGroupModels/permissionGroupCategoryPermit';
import {
  generateSubscriptionProductModel,
  ISubscriptionProductModel
} from './subscription/subscriptionProduct';
import {
  generateSubscriptionOrderModel,
  ISubscriptionOrderModel
} from './subscription/subscriptionOrder';
import { generatePageModel, IPageModel } from './page';
import { generateFollowTagModel, IFollowTagModel } from './followTag';
import { generateSavedPostModel, SavedPostModel } from './savepost';
import { generatePollOptionModel, PollOptionModel } from './pollOption';
import { generatePollVoteModel, PollVoteModel } from './pollVote';
import {
  generateQuizModels,
  QuizChoiceModel,
  QuizModel,
  QuizQuestionModel
} from './quiz';

export interface IModels {
  Category: ICategoryModel;
  Post: IPostModel;
  Comment: ICommentModel;
  PostUpVote: VoteModel;
  PostDownVote: VoteModel;
  CommentUpVote: VoteModel;
  CommentDownVote: VoteModel;
  ForumClientPortalUser: IForumClientPortalUserModel;
  PermissionGroup: IPermissionGroupModel;
  PermissionGroupUser: IPermissionGroupUserModel;
  PermissionGroupCategoryPermit: IPermissionGroupCategoryPermitModel;
  FollowCpUser: IFollowCpUserModel;
  SubscriptionProduct: ISubscriptionProductModel;
  SubscriptionOrder: ISubscriptionOrderModel;
  Page: IPageModel;
  FollowTag: IFollowTagModel;
  SavedPost: SavedPostModel;
  PollOption: PollOptionModel;
  PollVote: PollVoteModel;
  Quiz: QuizModel;
  QuizQuestion: QuizQuestionModel;
  QuizChoice: QuizChoiceModel;
}

export let models: IModels | null = null;

export const generateModels = createGenerateModels<IModels>(
  models,
  (connection: Connection, subdomain: string): IModels => {
    models = {} as IModels;
    generateCategoryModel(subdomain, connection, models);
    generatePostModel(subdomain, connection, models);
    generateCommentModel(subdomain, connection, models);
    generateVoteModels(subdomain, connection, models);
    generateForumClientPortalUserModel(subdomain, connection, models);
    generateUserGroupModels(subdomain, connection, models);
    generateFollowCpUserModel(subdomain, connection, models);
    generateSubscriptionProductModel(subdomain, connection, models);
    generateSubscriptionOrderModel(subdomain, connection, models);
    generatePageModel(subdomain, connection, models);
    generateFollowTagModel(subdomain, connection, models);
    generateSavedPostModel(subdomain, connection, models);
    generatePollOptionModel(subdomain, connection, models);
    generatePollVoteModel(subdomain, connection, models);
    generateQuizModels(subdomain, connection, models);
    return models;
  }
);
