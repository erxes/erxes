import { CUSTOM_INTEGRATION_OWNER, pluginIntegrationRef } from '@erxes/core-contract';
import { caller, type Db, integrations, type StoredPluginIntegration } from '@erxes/core-db';
import { eq } from 'drizzle-orm';
import { callerCan } from '~/http/access';
import { fail, notFound } from '~/http/errors';
import { installedPlugin, installedPlugins } from '~/modules/plugins/installedPlugin';

export const CUSTOM_ACCOUNT_KIND = 'account';

export interface PluginDefinition {
  ref: string;
  plugin: string;
  apiUrl: string | undefined;
  spec: StoredPluginIntegration;
}

const definitionsOf = (plugin: {
  name: string;
  manifest: { api?: { url: string }; integrations?: StoredPluginIntegration[] } | null;
}): PluginDefinition[] =>
  (plugin.manifest?.integrations ?? []).map((spec) => ({
    ref: pluginIntegrationRef(plugin.name, spec.key),
    plugin: plugin.name,
    apiUrl: plugin.manifest?.api?.url,
    spec,
  }));

export const pluginDefinitions = async (client: Db) =>
  (await installedPlugins(client)).flatMap(definitionsOf);

const ownerOf = (ref: string) => {
  const [owner = '', key = ''] = ref.split('.');

  return { owner, key };
};

export const isCustomRef = (ref: string) => ownerOf(ref).owner === CUSTOM_INTEGRATION_OWNER;

const findDefinition = async (client: Db, ref: string) => {
  const { owner } = ownerOf(ref);
  const plugin = isCustomRef(ref) ? undefined : await installedPlugin(client, owner);

  return plugin ? definitionsOf(plugin).find((definition) => definition.ref === ref) : undefined;
};

export const mayManage = (definition: PluginDefinition) =>
  !definition.spec.permission || callerCan(definition.spec.permission);

export const definitionOf = async (client: Db, ref: string) => {
  const definition = await findDefinition(client, ref);

  if (!definition) throw notFound('Integration');

  return definition;
};

export const managedDefinition = async (client: Db, ref: string) => {
  const definition = await definitionOf(client, ref);

  if (!mayManage(definition)) {
    throw fail('NOT_ALLOWED', `You need the ${definition.spec.permission} permission`, {
      permission: definition.spec.permission ?? '',
    });
  }

  return definition;
};

export const ownDefinition = async (client: Db, key: string) =>
  definitionOf(client, pluginIntegrationRef(caller('plugin').plugin, key));

export const customIntegrationOf = async (client: Db, ref: string) => {
  const [row] = isCustomRef(ref)
    ? await client
        .select()
        .from(integrations)
        .where(eq(integrations.key, ownerOf(ref).key))
        .limit(1)
    : [];

  if (!row) throw notFound('Integration');

  return row;
};

export const kindLabel = (definition: PluginDefinition, kind: string) =>
  definition.spec.accounts.find((item) => item.kind === kind)?.label ?? kind;
