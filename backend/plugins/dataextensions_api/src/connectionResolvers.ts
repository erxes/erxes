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

const loadModels = createGenerateModels<IModels>(loadClasses);

const readCacheMs = () => {
  const value = Number(process.env.DATA_EXTENSIONS_ORG_CACHE_MS);

  return Number.isFinite(value) && value >= 0 ? value : 30000;
};

const MODELS_CACHE_MS = readCacheMs();
const MODELS_CACHE_MAX = 5000;
const cachedModels = new Map<
  string,
  { models: Promise<IModels>; at: number }
>();

/**
 * Models per tenant, kept for DATA_EXTENSIONS_ORG_CACHE_MS (30s; 0 turns it
 * off). On SaaS every lookup reads the organization from the core database,
 * and one runtime request needs models several times. The models depend on
 * the tenant only, never on the request, so sharing them is safe. Entries
 * expire from when they were stored, failed lookups (an unknown subdomain,
 * a slow core database) are not kept, and the oldest entry makes room.
 */
export const generateModels = (
  subdomain: string,
  context?: Record<string, any>,
): Promise<IModels> => {
  const cached = cachedModels.get(subdomain);

  if (cached && Date.now() - cached.at < MODELS_CACHE_MS) {
    return cached.models;
  }

  const models = loadModels(subdomain, context);

  if (!MODELS_CACHE_MS) {
    return models;
  }

  cachedModels.delete(subdomain);

  if (cachedModels.size >= MODELS_CACHE_MAX) {
    const oldest = cachedModels.keys().next().value;

    if (oldest !== undefined) {
      cachedModels.delete(oldest);
    }
  }

  cachedModels.set(subdomain, { models, at: Date.now() });

  models.catch(() => {
    if (cachedModels.get(subdomain)?.models === models) {
      cachedModels.delete(subdomain);
    }
  });

  return models;
};

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
