import { IFeaturedFieldOwner } from './types';

// Deterministic, so an owner can address its field by code without storing ids.
export const featuredFieldCode = (owner: IFeaturedFieldOwner, key: string) =>
  [owner.plugin, owner.module, owner.refId, key].filter(Boolean).join(':');

export const generateFieldsFromSchema = async (
  queSchema: any,
  namePrefix: string,
) => {
  const fields: any = [];

  // field definitions
  const { paths = [] } = queSchema || {};

  for (const name of Object.keys(paths)) {
    const path = paths[name];
    const { label, selectOptions } = path?.options || {};
    const type = path.instance;

    if (['String', 'Number', 'Date', 'Boolean'].includes(type) && label) {
      // add to fields list
      fields.push({
        _id: Math.random(),
        name: `${namePrefix}${name}`,
        label,
        type: path.instance,
        selectOptions,
      });
    }
  }

  return fields;
};
