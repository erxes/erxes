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
    return models;
  }
);
