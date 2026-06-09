import { IContext } from '~/connectionResolvers';
import { fetchAvailableErxesTools } from '~/mastra/tools/erxesTools';

export const toolQueries = {
  mastraTools: async (_: any, __: any, { models }: IContext) => {
    return models.MastraTool.getTools();
  },

  mastraTool: async (_: any, { _id }: { _id: string }, { models }: IContext) => {
    return models.MastraTool.getTool(_id);
  },

  mastraAvailableErxesTools: async (_: any, __: any, { models }: IContext) => {
    const settings = await models.MastraSettings.findOne({});
    return fetchAvailableErxesTools(settings);
  },
};
