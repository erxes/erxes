import { TContactFieldsSync } from 'erxes-api-shared/core-modules';
import { sendTRPCMessage } from 'erxes-api-shared/utils';
import { getContactFieldPlugins } from './contactFieldPlugins';

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
    // The contact change itself is saved; the plugin's records keep the old
    // id until it is applied again.
    console.error(
      `[contact fields] ${pluginName} could not apply "${sync.action}": ${
        error instanceof Error ? error.message : error
      }`,
    );
  }
};

/**
 * Tells every plugin keeping contact fields (`meta.contactFields`) that
 * contacts were merged or removed, so its records follow. Plugins save
 * their records' contacts themselves otherwise.
 */
export const sendContactFieldsSync = async (
  subdomain: string,
  sync: TContactFieldsSync,
) => {
  const pluginNames = await getContactFieldPlugins();

  await Promise.all(
    pluginNames.map((pluginName) => send(subdomain, pluginName, sync)),
  );
};
