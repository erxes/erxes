import { activeSchema, IActiveDocument, IActive } from './definitions/active';

import { Model } from 'mongoose';

export interface IActiveModel extends Model<IActiveDocument> {}

export const loadActiveDirectoryClass = (models) => {
  class ActiveDirectory {}

  activeSchema.loadClass(ActiveDirectory);

  return activeSchema;
};
