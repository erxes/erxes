import {
  CONTACT_FIELD_RECORD_PLUGINS,
  IContactLink,
  TContactFieldsSync,
} from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';

const ALL_PLUGINS = [...new Set(Object.values(CONTACT_FIELD_RECORD_PLUGINS))];

const send = async (
  subdomain: string,
  pluginName: string,
  sync: TContactFieldsSync,
) => {
  try {
    await sendTRPCMessage({
      subdomain,
      pluginName,
      method: 'mutation',
      module: 'contactFields',
      action: 'sync',
      input: sync,
      throwOnError: true,
    });
  } catch (error) {
    // The relation itself is saved; re-running the contact-fields migration
    // repairs a record whose sync was lost.
    console.error(
      `[contact fields] ${pluginName} could not apply "${sync.action}": ${
        error instanceof Error ? error.message : error
      }`,
    );
  }
};

/**
 * Tells the plugins owning these records that their contact links changed,
 * so their `customerIds` / `companyIds` follow `relations`. Merges and
 * removals go to every such plugin.
 */
export const sendContactFieldsSync = async (
  subdomain: string,
  sync: TContactFieldsSync,
) => {
  if (sync.action === 'merge' || sync.action === 'remove') {
    await Promise.all(
      ALL_PLUGINS.map((pluginName) => send(subdomain, pluginName, sync)),
    );
    return;
  }

  if (!sync.links.length) {
    return;
  }

  const linksByPlugin = new Map<string, IContactLink[]>();

  for (const link of sync.links) {
    const pluginName = CONTACT_FIELD_RECORD_PLUGINS[link.contentType];

    if (pluginName) {
      linksByPlugin.set(pluginName, [
        ...(linksByPlugin.get(pluginName) || []),
        link,
      ]);
    }
  }

  await Promise.all(
    [...linksByPlugin].map(([pluginName, links]) =>
      send(subdomain, pluginName, { action: sync.action, links }),
    ),
  );
};
