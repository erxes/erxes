import { type Db, integrationConnections } from '@erxes/core-db';
import { asc, inArray } from 'drizzle-orm';
import { appEventType } from '@erxes/core-contract';
import { APPS, paramsSchema } from './apps';
import { fieldsOf } from '@erxes/plugin-sdk/integrations';

export const appTriggerTypes = () =>
  APPS.flatMap((app) =>
    app.triggers.map((trigger) => ({
      type: appEventType(app.key, trigger.key),
      label: `${app.name}: ${trigger.label}`,
      description: trigger.description,
      source: app.key,
      subject: null,
      record: null,
      fields: trigger.outputs,
    })),
  );

export const appCatalog = async (client: Db) => {
  const connections = APPS.length
    ? await client
        .select({
          id: integrationConnections.id,
          key: integrationConnections.key,
          name: integrationConnections.name,
          status: integrationConnections.status,
        })
        .from(integrationConnections)
        .where(
          inArray(
            integrationConnections.key,
            APPS.map((app) => app.key),
          ),
        )
        .orderBy(asc(integrationConnections.createdAt))
    : [];

  return APPS.map((app) => ({
    key: app.key,
    name: app.name,
    category: app.category,
    triggers: app.triggers.map((trigger) => {
      const params = paramsSchema(app, trigger);

      return {
        key: trigger.key,
        type: appEventType(app.key, trigger.key),
        label: trigger.label,
        description: trigger.description,
        via: trigger.via,
        params: params ? fieldsOf(params) : [],
      };
    }),
    records: Object.keys(app.records ?? {}),
    connections: connections.flatMap(({ key, ...connection }) =>
      key === app.key ? [connection] : [],
    ),
  }));
};
