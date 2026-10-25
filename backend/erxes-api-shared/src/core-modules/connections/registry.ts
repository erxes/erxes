import {
  BUILT_IN_CONNECTION_TYPES,
  CONNECTION_TYPE_ID_PATTERN,
  describeConnectionType,
} from './constants';
import {
  IConnectionsMeta,
  IConnectionsRegistration,
  IConnectionTypeDefinition,
} from './types';

/**
 * This process's own connection registration: the service name the helpers
 * sign reads with, and the type definitions whose `test` / `resolve` run here.
 */

let registeredService: string | null = null;
const localTypes = new Map<string, IConnectionTypeDefinition>();

/**
 * Validates and records a service's `meta.connections`. Returns what is
 * published to service discovery. Throws on an invalid declaration.
 */
export const registerConnections = (
  pluginName: string,
  config: IConnectionsMeta,
): IConnectionsRegistration => {
  const definitions = config.types || [];
  const types = definitions.map((definition) =>
    describeConnectionType(pluginName, definition),
  );

  if (new Set(types.map((type) => type.id)).size !== types.length) {
    throw new Error(`Duplicate connection type ids in ${pluginName}`);
  }

  const uses = [...new Set(config.uses || [])];
  const invalidUse = uses.find((id) => !CONNECTION_TYPE_ID_PATTERN.test(id));

  if (invalidUse) {
    throw new Error(
      `Invalid connection type id "${invalidUse}" in ${pluginName} meta.connections.uses`,
    );
  }

  registeredService = pluginName;
  localTypes.clear();
  types.forEach((type, index) => localTypes.set(type.id, definitions[index]));

  return { types, uses };
};

export const getRegisteredConnectionsService = () => registeredService;

/** A type whose resolvers run in this process: its own or a built-in one. */
export const getLocalConnectionType = (
  typeId: string,
): IConnectionTypeDefinition | undefined =>
  localTypes.get(typeId) || BUILT_IN_CONNECTION_TYPES[typeId];

export const resetConnectionsRegistration = () => {
  registeredService = null;
  localTypes.clear();
};
