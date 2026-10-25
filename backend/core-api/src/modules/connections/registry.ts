import {
  BUILT_IN_CONNECTION_TYPES,
  CONNECTION_TYPE_ID_PATTERN,
  CONNECTIONS_MODULE,
  describeConnectionType,
  IConnectionsRegistration,
  IConnectionTypeDescriptor,
} from 'erxes-api-shared/core-modules';
import { getAvailablePlugins, getPlugin } from 'erxes-api-shared/utils';
import { z } from 'zod';

/**
 * The connection type registry: core's built-in types plus the descriptors
 * each service tenant can use published through `meta.connections`
 * (service discovery). Only descriptors whose id is namespaced by the
 * publishing service are accepted, so one service cannot shadow another's.
 */

const CORE = 'core';

const BUILT_IN_DESCRIPTORS: IConnectionTypeDescriptor[] = Object.values(
  BUILT_IN_CONNECTION_TYPES,
).map((definition) => describeConnectionType(CORE, definition));

const fieldSchema = z.object({
  key: z.string(),
  label: z.string(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
  required: z.boolean().optional(),
  secret: z.boolean().optional(),
  inputType: z.enum(['text', 'url', 'email', 'number', 'textarea']).optional(),
  pattern: z.string().optional(),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
});

const registrationSchema = z.object({
  types: z
    .array(
      z.object({
        id: z.string().regex(CONNECTION_TYPE_ID_PATTERN),
        pluginName: z.string(),
        label: z.string(),
        description: z.string().optional(),
        icon: z.string(),
        fields: z.array(fieldSchema),
        allowCustomFields: z.boolean(),
        hasTest: z.boolean(),
        hasResolve: z.boolean(),
      }),
    )
    .default([]),
  uses: z.array(z.string().regex(CONNECTION_TYPE_ID_PATTERN)).default([]),
});

/** A service's published registration, or null when it declared none. */
export const getServiceRegistration = async (
  service: string,
): Promise<IConnectionsRegistration | null> => {
  const plugin = await getPlugin(service);
  const parsed = registrationSchema.safeParse(
    plugin?.config?.meta?.[CONNECTIONS_MODULE],
  );

  if (!parsed.success) {
    return null;
  }

  return {
    types: parsed.data.types.filter(
      (type) =>
        type.pluginName === service && type.id.startsWith(`${service}:`),
    ),
    uses: parsed.data.uses,
  };
};

export const getConnectionTypes = async (
  subdomain: string,
): Promise<IConnectionTypeDescriptor[]> => {
  const services = (await getAvailablePlugins(subdomain)).filter(
    (name) => name && name !== CORE,
  );

  const registrations = await Promise.all(
    [...new Set(services)].map((service) => getServiceRegistration(service)),
  );

  return [
    ...BUILT_IN_DESCRIPTORS,
    ...registrations.flatMap((registration) => registration?.types || []),
  ];
};

export const getConnectionType = async (
  subdomain: string,
  typeId: string,
): Promise<IConnectionTypeDescriptor | undefined> => {
  const builtIn = BUILT_IN_DESCRIPTORS.find((type) => type.id === typeId);

  if (builtIn) {
    return builtIn;
  }

  return (await getConnectionTypes(subdomain)).find(
    (type) => type.id === typeId,
  );
};

/**
 * The plugin access allow-list: a service reads a type it registered itself
 * or one it listed in `meta.connections.uses`, and only while it is
 * available to the tenant.
 */
export const canServiceReadType = async (
  subdomain: string,
  service: string,
  typeId: string,
): Promise<boolean> => {
  if (service === CORE) {
    return false;
  }

  if (!(await getAvailablePlugins(subdomain)).includes(service)) {
    return false;
  }

  const registration = await getServiceRegistration(service);

  if (!registration) {
    return false;
  }

  return (
    registration.types.some((type) => type.id === typeId) ||
    registration.uses.includes(typeId)
  );
};
