import { escapeRegExp } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import { getConnectionTypes } from '@/connections/registry';
import { toConnectionView } from '@/connections/service';

export const SHOW_CONNECTIONS = 'showConnections';
const MAX_CONNECTIONS = 500;

export const connectionQueries = {
  async connectionsTypes(
    _root: undefined,
    _args: undefined,
    { subdomain, checkPermission }: IContext,
  ) {
    await checkPermission(SHOW_CONNECTIONS);

    return getConnectionTypes(subdomain);
  },

  async connections(
    _root: undefined,
    { searchValue, type }: { searchValue?: string; type?: string },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission(SHOW_CONNECTIONS);

    const search = searchValue?.trim();
    const [connections, types] = await Promise.all([
      models.Connections.find({
        ...(type ? { type } : {}),
        ...(search
          ? { name: { $regex: escapeRegExp(search), $options: 'i' } }
          : {}),
      })
        .sort({ name: 1 })
        .limit(MAX_CONNECTIONS),
      getConnectionTypes(subdomain),
    ]);

    return connections.map((connection) =>
      toConnectionView(
        connection,
        types.find((descriptor) => descriptor.id === connection.type),
      ),
    );
  },

  async connectionsDetail(
    _root: undefined,
    { _id }: { _id: string },
    { models, subdomain, checkPermission }: IContext,
  ) {
    await checkPermission(SHOW_CONNECTIONS);

    const connection = await models.Connections.getConnection(_id);
    const types = await getConnectionTypes(subdomain);

    return toConnectionView(
      connection,
      types.find((descriptor) => descriptor.id === connection.type),
    );
  },
};
