import { ExpectedError, markResolvers } from 'erxes-api-shared/utils';
import { IContext } from '~/connectionResolvers';
import {
  IConnectionAddInput,
  IConnectionEditInput,
} from '@/connections/@types/connection';
import { getConnectionType } from '@/connections/registry';
import { testConnection, toConnectionView } from '@/connections/service';

export const MANAGE_CONNECTIONS = 'manageConnections';

export const connectionMutations = {
  async connectionsAdd(
    _root: undefined,
    { input }: { input: IConnectionAddInput },
    { models, subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission(MANAGE_CONNECTIONS);

    const descriptor = await getConnectionType(subdomain, input?.type);

    if (!descriptor) {
      throw new ExpectedError('Choose an available connection type', 'BAD_USER_INPUT');
    }

    const connection = await models.Connections.createConnection(
      input,
      descriptor,
      user?._id,
    );

    return toConnectionView(connection, descriptor);
  },

  async connectionsEdit(
    _root: undefined,
    { _id, input }: { _id: string; input: IConnectionEditInput },
    { models, subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission(MANAGE_CONNECTIONS);

    const existing = await models.Connections.getConnection(_id);
    const descriptor = await getConnectionType(subdomain, existing.type);
    const connection = await models.Connections.updateConnection(
      _id,
      input,
      descriptor,
      user?._id,
    );

    return toConnectionView(connection, descriptor);
  },

  async connectionsRemove(
    _root: undefined,
    { _id }: { _id: string },
    { models, checkPermission }: IContext,
  ) {
    await checkPermission(MANAGE_CONNECTIONS);

    const connection = await models.Connections.removeConnection(_id);

    return connection._id;
  },

  async connectionsTest(
    _root: undefined,
    { _id }: { _id: string },
    { models, subdomain, user, checkPermission }: IContext,
  ) {
    await checkPermission(MANAGE_CONNECTIONS);

    return testConnection(models, subdomain, _id, user?._id);
  },
};

// Inputs carry secret values: keep them out of mutation logs and plugin
// before-resolver hooks.
markResolvers(connectionMutations, { wrapperConfig: { sensitiveArgs: true } });
