import { IContext } from '~/connectionResolvers';
import { autoCreateErxesTools } from '~/mastra/tools/erxesTools';

export const toolMutations = {
  mastraToolCreate: async (_: any, { doc }: any, { models }: IContext) => {
    return models.MastraTool.createTool(doc);
  },

  mastraToolUpdate: async (_: any, { _id, doc }: any, { models }: IContext) => {
    return models.MastraTool.updateTool(_id, doc);
  },

  mastraToolRemove: async (_: any, { _id }: { _id: string }, { models }: IContext) => {
    return models.MastraTool.removeTool(_id);
  },

  mastraAutoCreateTools: async (_: any, __: any, { models }: IContext) => {
    const settings = await models.MastraSettings.findOne({});
    return autoCreateErxesTools(settings, models);
  },
};
