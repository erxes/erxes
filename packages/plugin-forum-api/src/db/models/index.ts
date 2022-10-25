import { createGenerateModels } from '@erxes/api-utils/src/core';

import { Connection } from 'mongoose';
import { generateCategoryModel, ICategoryModel } from './category';
import { generateCommentModel, ICommentModel } from './comment';
import {
  generateForumClientPortalUserModel,
  IForumClientPortalUserModel
} from './forumClientPortalUser';
import { generatePostModel, IPostModel } from './post';
import {
  generateClientPortalUserGroupModel,
  IUserGroupModel,
  IUserGroupUsersModel
} from './userGroup';
import { generateVoteModels, VoteModel } from './vote';

export interface IModels {
  Category: ICategoryModel;
  Post: IPostModel;
  Comment: ICommentModel;
  PostUpVote: VoteModel;
  PostDownVote: VoteModel;
  CommentUpVote: VoteModel;
  CommentDownVote: VoteModel;
  ForumClientPortalUser: IForumClientPortalUserModel;
  UserGroup: IUserGroupModel;
  UserGroupUsers: IUserGroupUsersModel;
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
    generateClientPortalUserGroupModel(subdomain, connection, models);
    return models;
  }
);
