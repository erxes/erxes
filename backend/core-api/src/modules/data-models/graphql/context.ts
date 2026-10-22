import type { Model } from 'mongoose';
import { createDataModelDefinitionStore } from '../db/models/DataModelDefinitions';
import { DataModelRegistry } from '../registry';
import type { IDataModelDefinitionDocument } from '../types';

export interface DataModelContext {
  models: { DataModelDefinitions: Model<IDataModelDefinitionDocument> };
  user?: { _id: string } | null;
  checkPermission: (action: string) => Promise<void>;
}

export const authorizeDataModel = async (
  context: DataModelContext,
  action: string,
) => {
  if (!context.user?._id) throw new Error('Authentication required');
  await context.checkPermission(action);
  return {
    registry: new DataModelRegistry(
      createDataModelDefinitionStore(context.models.DataModelDefinitions),
    ),
    actorId: context.user._id,
  };
};
