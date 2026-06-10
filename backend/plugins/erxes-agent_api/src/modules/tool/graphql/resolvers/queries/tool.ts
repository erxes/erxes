import { IContext } from '~/connectionResolvers';
import { getOperationRegistry } from '~/mastra/tools/operationRegistry';

export const toolQueries = {
  // The full list of runnable erxes operations, derived from a live (cached)
  // schema introspection. Powers the agent form's "restrict to specific
  // operations" picker. No persisted tool docs are involved any more.
  mastraAvailableErxesTools: async (_: any, __: any, { models }: IContext) => {
    const settings = await models.MastraSettings.findOne({});
    const registry = await getOperationRegistry(settings);
    return registry.list;
  },
};
