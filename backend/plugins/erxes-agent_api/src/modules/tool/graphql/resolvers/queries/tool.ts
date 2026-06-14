import { IContext } from '~/connectionResolvers';
import { getOperationRegistry } from '~/mastra/tools/operationRegistry';

/** Queries exposing the live erxes operation registry to the UI. */
export const toolQueries = {
  // The full list of runnable erxes operations, derived from a live (cached)
  // schema introspection. Powers the agent form's "restrict to specific
  // operations" picker. No persisted tool docs are involved any more.
  mastraAvailableErxesTools: async (
    _parent: undefined,
    _args: undefined,
    { models }: IContext,
  ) => {
    const settings = await models.MastraSettings.findOne({});
    const registry = await getOperationRegistry(settings);
    return registry.list;
  },
};
