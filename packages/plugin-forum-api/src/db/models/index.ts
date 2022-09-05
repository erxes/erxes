import { createGenerateModels } from '@erxes/api-utils/src/core';

import { Connection } from 'mongoose';
import { generateCategoryModel, ICategoryModel } from './category';
import { generateCommentModel, ICommentModel } from './comment';
import { generatePostModel, IPostModel } from './post';
import { VoteModel } from './vote';
export interface IModels {
  Category: ICategoryModel;
  Post: IPostModel;
  Comment: ICommentModel;
  PostUpVote: VoteModel;
  PostDownVote: VoteModel;
  CommentUpVote: VoteModel;
  CommentDownVote: VoteModel;
}

export let models: IModels | null = null;

export const generateModels = createGenerateModels<IModels>(
  models,
  (connection: Connection, subdomain: string): IModels => {
    models = {} as IModels;
    generateCategoryModel(subdomain, connection, models);
    generatePostModel(subdomain, connection, models);
    generateCommentModel(subdomain, connection, models);
    return models;
  }
);
