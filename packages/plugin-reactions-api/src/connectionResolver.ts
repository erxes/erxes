import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import {
  ICommentDocument,
  IEmojiDocument
} from './models/definitions/reaction'; // ICommentDocument IEmojiDocument
import {
  loadCommentClass, // loadCommentClass
  loadEmojiClass, // loadEmojiClass
  ICommentModel, // ICommentModel
  IEmojiModel // IEmojiModel
} from './models/reactions';
import { createGenerateModels } from '@erxes/api-utils/src/core';

export interface IModels {
  Emojis: IEmojiModel;
  Comments: ICommentModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels | null = null;

export const loadClasses = (db: mongoose.Connection): IModels => {
  models = {} as IModels;

  models.Emojis = db.model<IEmojiDocument, IEmojiModel>(
    'emojis',
    loadEmojiClass(models)
  );

  models.Comments = db.model<ICommentDocument, ICommentModel>(
    'comments',
    loadCommentClass(models)
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(
  models,
  loadClasses
);
