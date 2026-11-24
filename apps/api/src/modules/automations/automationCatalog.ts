import { type Db, pluginInstallations, plugins } from '@erxes/core-db';
import { and, eq } from 'drizzle-orm';
import { connectedIntegrations } from '~/modules/integrations/actions';
import { appCatalog, appTriggerTypes } from '~/modules/integrations/appCatalog';
import { eventTypeCatalog } from '~/modules/webhooks/webhooks.service';
import { type CatalogSearch, keyLabel } from '@erxes/core-contract';
import { actionCatalog } from './actions/catalog';
import { actionText, ranked } from './catalogSearch';
import { type Carried, healedFields } from './dataFields';
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
        label: keyLabel(rest.join(' ')),
        description: null,
        source,
        subject: null,
        record: null,
        fields: healedFields([], carried),
        seen: true,
      },
    ];
  });

const matching = ({ triggers, actions, apps }: Catalog, search: string, limit: number) => {
  const found = {
    triggers: ranked(triggers, search, (trigger) => ({
      label: `${trigger.label} ${trigger.type}`,
      rest: `${trigger.description ?? ''} ${trigger.record ?? ''} ${trigger.source}`,
    })).slice(0, limit),
    actions: ranked(actions, search, actionText).slice(0, limit),
  };

  const types = new Set(found.triggers.map((trigger) => trigger.type));

  const keys = new Set([
    ...found.triggers.map((trigger) => trigger.source),
    ...found.actions.flatMap((action) => (action.integration ? [action.integration] : [])),
  ]);

  return {
    ...found,
    apps: apps
      .filter((app) => keys.has(app.key))
      .map((app) => ({ ...app, triggers: app.triggers.filter(({ type }) => types.has(type)) })),
  };
};

const fullCatalog = async (client: Db) => {
  const triggers = [...(await eventTypeCatalog(client)), ...appTriggerTypes()];
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
    apps: await appCatalog(client),
  };
};

const SEARCH_LIMIT = 5;

type Catalog = Awaited<ReturnType<typeof fullCatalog>>;

export const automationCatalog = async (client: Db, { search, limit }: CatalogSearch = {}) => {
  const catalog = await fullCatalog(client);

  return search ? matching(catalog, search, limit ?? SEARCH_LIMIT) : catalog;
};
