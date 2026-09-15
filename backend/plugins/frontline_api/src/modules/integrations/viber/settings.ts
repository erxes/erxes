import type { IContext, IModels } from '~/connectionResolvers';
import type { IViberMediaSettings } from './@types/settings';
import { getViberMediaAllowedHostnames } from './config';
import {
  VIBER_DEFAULT_MEDIA_HOSTNAMES,
  VIBER_MEDIA_SETTINGS_ID,
} from './constants';
import { normalizeViberMediaHostnames } from './utils/mediaHostnames';

// Models belong to the request tenant. Never cache policy across requests.
export const resolveViberMediaSettings = async (
  models: Pick<IModels, 'ViberSettings'>,
  subdomain: string,
): Promise<IViberMediaSettings> => {
  if (!subdomain.trim()) throw new Error('Subdomain is required');
  const settings = await models.ViberSettings.findOne({
    _id: VIBER_MEDIA_SETTINGS_ID,
  });
  if (settings) {
    return {
      hostnames: normalizeViberMediaHostnames(settings.mediaHostnames),
      source: 'settings',
    };
  }
  const hostnames = [...getViberMediaAllowedHostnames(subdomain)];
  return hostnames.length
    ? { hostnames, source: 'environment' }
    : { hostnames: [...VIBER_DEFAULT_MEDIA_HOSTNAMES], source: 'default' };
};

export const getViberMediaSettings = async (
  context: IContext,
): Promise<IViberMediaSettings> => {
  if (!context.user?._id) throw new Error('Authentication required');
  await context.checkPermission('showIntegrations');
  return resolveViberMediaSettings(context.models, context.subdomain);
};

export const updateViberMediaSettings = async (
  context: IContext,
  hostnames: string[] | null,
): Promise<IViberMediaSettings> => {
  if (!context.user?._id) throw new Error('Authentication required');
  await context.checkPermission('integrationsEdit');
  if (!context.subdomain.trim()) throw new Error('Subdomain is required');
  const selector = { _id: VIBER_MEDIA_SETTINGS_ID };
  if (hostnames === null) {
    // Validate the fallback before removing the explicit override.
    getViberMediaAllowedHostnames(context.subdomain);
    const result = await context.models.ViberSettings.deleteOne(selector);
    if (!result.acknowledged)
      throw new Error('Unable to reset Viber settings.');
  } else {
    const mediaHostnames = normalizeViberMediaHostnames(hostnames);
    const result = await context.models.ViberSettings.updateOne(
      selector,
      { $set: { mediaHostnames } },
      { upsert: true, runValidators: true },
    );
    if (!result.acknowledged)
      throw new Error('Unable to update Viber settings.');
  }
  return resolveViberMediaSettings(context.models, context.subdomain);
};
