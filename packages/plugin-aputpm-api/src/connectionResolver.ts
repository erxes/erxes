import { IContext as IMainContext } from '@erxes/api-utils/src';
import { createGenerateModels } from '@erxes/api-utils/src/core';
import * as mongoose from 'mongoose';
import { ISafetyTipDocument } from './models/definitions/safetyTips';
import { ISafetyTipsModel, loadSafetyTipsClass } from './models/SafetyTips';
export interface IModels {
  SafetyTips: ISafetyTipsModel;
}

export interface IContext extends IMainContext {
  subdomain: string;
  models: IModels;
}

export const loadClasses = (
  db: mongoose.Connection,
  subdomain: string,
): IModels => {
  const models = {} as IModels;

  models.SafetyTips = db.model<ISafetyTipDocument, ISafetyTipsModel>(
    'safety_tips',
    loadSafetyTipsClass(models, subdomain),
  );

  return models;
};

export const generateModels = createGenerateModels<IModels>(loadClasses);
