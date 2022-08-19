import * as mongoose from 'mongoose';
import { mainDb } from './configs';
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

export interface IModels {
  Emojis: IEmojiModel;
  Comments: ICommentModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export let models: IModels;

export const generateModels = async (
  _hostnameOrSubdomain: string
): Promise<IModels> => {
  if (models) {
    return models;
  }

  loadClasses(mainDb);

  return models;
};

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
