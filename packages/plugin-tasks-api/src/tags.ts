import { generateModels } from "./connectionResolver";

export default {
  types: [
    {
      description: "Tasks",
      type: "task"
    }
  ],

  tag: async ({ subdomain, data }) => {
    const { type, targetIds, tagIds, _ids, action } = data;

    const models = await generateModels(subdomain);

    let response = {};
    const model: any = models.Tasks;

    if (action === "count") {
      response = await model.countDocuments({ tagIds: { $in: _ids } });
    }

    if (action === "tagObject") {
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
    data: { sourceId, destId, action }
  }) => {
    const models = await generateModels(subdomain);
    const model: any = models.Tasks;

    if (action === "remove") {
      await model.updateMany(
        { tagIds: { $in: [sourceId] } },
        { $pull: { tagIds: { $in: [sourceId] } } }
      );
    }

    if (action === "merge") {
      const itemIds = await model
        .find({ tagIds: { $in: [sourceId] } }, { _id: 1 })
        .distinct("_id");

      // add to the new destination
      await model.updateMany(
        { _id: { $in: itemIds } },
        { $set: { "tagIds.$[elem]": destId } },
        { arrayFilters: [{ elem: { $eq: sourceId } }] }
      );
    }
  }
};
