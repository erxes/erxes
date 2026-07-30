import {
  BROADCAST_PROVIDER_FIELDS,
  BROADCAST_SETTINGS_CONFIG_FIELDS,
} from '@/broadcast/constants';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { useVersion } from 'ui-modules';

export const BROADCAST_MODE_FIELD = 'BROADCAST_EMAIL_MODE';
export const BROADCAST_PROVIDER_FIELD = 'BROADCAST_DEFAULT_EMAIL_SERVICE';

/** Every config code this page loads and writes. */
export const BROADCAST_CONFIG_CODES = [
  ...BROADCAST_SETTINGS_CONFIG_FIELDS.map(({ name }) => name),
  BROADCAST_MODE_FIELD,
  BROADCAST_PROVIDER_FIELD,
  ...Object.values(BROADCAST_PROVIDER_FIELDS).flatMap((fields) =>
    fields.map(({ name }) => name),
  ),
];

/**
 * Decides which half of the credentials section to show. Mirrors what the
 * backend does with the same settings, so the page can never offer a provider
 * the send path would not use.
 */
export const useBroadcastEmailCredentials = (form: UseFormReturn<any>) => {
  const isSaas = useVersion('saas');

  const [mode, provider, legacyAccessKey] = useWatch({
    control: form.control,
    name: [
      BROADCAST_MODE_FIELD,
      BROADCAST_PROVIDER_FIELD,
      'BROADCAST_AWS_SES_ACCESS_KEY_ID',
    ],
  });

  // Installs that configured broadcast credentials before this setting existed
  // are already sending on them, so show them as such rather than implying they
  // fall back to the mail config.
  const usesOwnCredentials = mode ? mode === 'custom' : !!legacyAccessKey;

  return {
    // SaaS campaigns always run on the account erxes manages, so there is
    // nothing to choose.
    showCredentials: !isSaas,
    usesOwnCredentials,
    providerFields: BROADCAST_PROVIDER_FIELDS[provider || 'SES'] || [],
  };
};
