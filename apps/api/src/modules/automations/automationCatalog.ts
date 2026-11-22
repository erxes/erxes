import { type Db, pluginInstallations, plugins } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { connectedIntegrations } from '~/modules/integrations/actions';
import { eventTypeCatalog } from '~/modules/webhooks/webhooks.service';
import { actionCatalog } from './actions/catalog';
import { type Carried, healedFields, labelOf } from './dataFields';
import { isEventType, learnedEventData, outputType } from './eventData';

const installedPlugins = (client: Db) =>
  client
    .select({ name: plugins.name, manifest: plugins.manifest })
    .from(plugins)
    .innerJoin(pluginInstallations, eq(pluginInstallations.plugin, plugins.name))
    .where(and(eq(pluginInstallations.status, 'active'), eq(plugins.status, 'active')));

const unexpectedTriggers = (
  learned: Map<string, Carried[]>,
  declared: Set<string>,
  installed: Set<string>,
) =>
  [...learned.entries()].flatMap(([type, carried]) => {
    const [source = '', ...rest] = type.split('.');

    if (declared.has(type) || !isEventType(type) || !installed.has(source)) return [];

    return [
      {
        type,
        label: labelOf(rest.join(' ')),
        description: null,
        source,
        subject: null,
        record: null,
        fields: healedFields([], carried),
        seen: true,
      },
    ];
  });

export const automationCatalog = async (client: Db) => {
  const triggers = await eventTypeCatalog(client);
  const installed = await installedPlugins(client);
  const learned = await learnedEventData(client);
  const actions = actionCatalog(installed, await connectedIntegrations(client));

  return {
    triggers: [
      ...triggers.map((trigger) => ({
        ...trigger,
        fields: healedFields(trigger.fields, learned.get(trigger.type) ?? []),
        seen: learned.has(trigger.type),
      })),
      ...unexpectedTriggers(
        learned,
        new Set(triggers.map((trigger) => trigger.type)),
        new Set(installed.map((plugin) => plugin.name)),
      ),
    ],
    actions: actions.map((action) => {
      const carried = learned.get(outputType(action.type));

      return carried ? { ...action, outputs: healedFields(action.outputs, carried) } : action;
    }),
  };
};
