import { IContext } from "../../connectionResolver";

const sampleQueries = {
  samples: async (
    _root,
    {
      typeId
    },
    { models }: IContext
  ) => {

    const selector: any = {};

    if (typeId) {
      selector.typeId = typeId;
    }

    return await models.Samples.find(selector).sort({ order: 1, name: 1 });
  },

  sampleTypes: async (_root, _args, { models }: IContext) => {
    return await models.Types.find({});
  },

  samplesTotalCount: async (_root, _args, { models }: IContext) => {
    return await models.Samples.find({}).countDocuments();
  }
};

export default sampleQueries;
