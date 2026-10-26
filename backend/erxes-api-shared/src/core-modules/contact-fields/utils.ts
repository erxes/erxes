import { Model } from 'mongoose';
import { CONTACT_FIELD_BY_KIND } from './constants';
import { IContactFields, TContactFieldsSync } from './types';

type TContactFieldsModel = Pick<Model<IContactFields>, 'updateMany'>;

/**
 * Applies a contact change core broadcasts (tRPC `contactFields.sync`) to a
 * plugin's records: a merged contact's records move to the merged one, a
 * removed contact is taken off them. The plugin owns its records' contact
 * fields otherwise.
 */
export const applyContactFieldsSync = async (
  models: TContactFieldsModel[],
  sync: TContactFieldsSync,
) => {
  const oldIds = sync.action === 'merge' ? sync.oldIds : sync.ids;

  if (!oldIds.length) {
    return;
  }

  const field = CONTACT_FIELD_BY_KIND[sync.kind];
  const next = sync.action === 'merge' ? sync.newId : null;

  for (const model of new Set(models)) {
    await model.updateMany(
      { [field]: { $in: oldIds } },
      { $set: { [field]: next } },
    );
  }
};
