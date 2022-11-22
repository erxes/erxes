import { generateModels, IModels } from './db/models/';

const TAG_TYPE_DESCS = [
  {
    description: 'Forum Post',
    type: 'post'
  }
] as const;

const TAG_TYPES = TAG_TYPE_DESCS.map(desc => desc.type);

type TagTypes = typeof TAG_TYPES[number];

const tagTypeModelName: Record<TagTypes, keyof IModels> = {
  post: 'Post'
};

export default {
  types: TAG_TYPE_DESCS,
  tag: async ({ subdomain, data }) => {
    const { type, action, _ids, tagIds, targetIds } = data;

    const models = await generateModels(subdomain);
    const model = models[tagTypeModelName[type as TagTypes]];

    let response = {};

    if (action === 'count') {
      response = await model.countDocuments({
        tagIds: { $in: _ids },
        state: 'PUBLISHED'
      });
    }

    if (action === 'tagObject') {
      await model.updateMany(
        { _id: { $in: targetIds } },
        { $set: { tagIds } },
        { multi: true }
      );

      response = await model.find({ _id: { $in: targetIds } }).lean();
    }

    return response;
  },
  fixRelatedItems: async ({
    subdomain,
    data: { sourceId, destId, type, action }
  }) => {
    console.log('-----------------------------------------------');
    console.log({
      sourceId,
      destId,
      type,
      action
    });
    console.log('-----------------------------------------------');

    const models = await generateModels(subdomain);
    const model = models[tagTypeModelName[type as TagTypes]];

    if (action === 'remove') {
      await model.updateMany(
        { tagIds: { $in: [sourceId] } },
        { $pull: { tagIds: { $in: [sourceId] } } }
      );
    }

    if (action === 'merge') {
      const itemIds = await model
        .find({ tagIds: { $in: [sourceId] } }, { _id: 1 })
        .distinct('_id');

      // add to new destination
      await model.updateMany(
        { _id: { $in: itemIds } },
        { $set: { 'tagIds.$[elem]': destId } },
        { arrayFilters: [{ elem: { $eq: sourceId } }] }
      );
    }
  }
};
