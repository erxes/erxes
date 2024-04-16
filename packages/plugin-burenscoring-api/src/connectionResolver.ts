import * as mongoose from 'mongoose';
import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import { IBurenScoringModel, loadBurenscoringClass} from '././models/burenScoring';
import { IBurenScoringDocument, IBurenscoring } from './models/definitions/burenscoring';

export interface IModels {
  BurenScorings: IBurenScoringModel;
}
export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = (db: mongoose.Connection): IModels => {
  const models = {} as IModels;

  models.BurenScorings = db.model<IBurenScoringDocument, IBurenScoringModel>(
    'burenscoring',
    loadBurenscoringClass(models),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);