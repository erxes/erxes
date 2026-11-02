import {
  getDataExtensionModels,
  IDataExtensionModels,
} from 'erxes-api-shared/core-modules';
import { IMainContext } from 'erxes-api-shared/core-types';
import { createGenerateModels } from 'erxes-api-shared/utils';
import mongoose from 'mongoose';

/**
 * Data Extensions keeps its metadata, history, webhooks, views and custom
 * object records in the tenant database it shares with core, under the same
 * collection names core used, so either service can serve a tenant.
 */
export type IModels = IDataExtensionModels;

export interface IContext extends IMainContext {
  models: IModels;
  subdomain: string;
}

export const loadClasses = (db: mongoose.Connection): IModels =>
  getDataExtensionModels(db);

export const generateModels = createGenerateModels<IModels>(loadClasses);

/**
 * Whether a team member may write. Core owns users; the app reads the one
 * flag it needs from the shared tenant database instead of a full model.
 */
export const isActiveUser = async (models: IModels, userId: string) =>
  Boolean(
    await models.DataExtensionFields.db
      .collection('users')
      .findOne(
        { _id: userId as never, isActive: { $ne: false } },
        { projection: { _id: 1 } },
      ),
  );
