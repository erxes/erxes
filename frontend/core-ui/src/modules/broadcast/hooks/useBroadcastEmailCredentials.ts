import {
  BROADCAST_PROVIDER_FIELDS,
  BROADCAST_SETTINGS_CONFIG_FIELDS,
} from '@/broadcast/constants';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { useVersion } from 'ui-modules';

export const BROADCAST_MODE_FIELD = 'BROADCAST_EMAIL_MODE';
export const BROADCAST_PROVIDER_FIELD = 'BROADCAST_DEFAULT_EMAIL_SERVICE';

export const BROADCAST_CONFIG_CODES = [
  ...BROADCAST_SETTINGS_CONFIG_FIELDS.map(({ name }) => name),
  BROADCAST_MODE_FIELD,
  BROADCAST_PROVIDER_FIELD,
  ...Object.values(BROADCAST_PROVIDER_FIELDS).flatMap((fields) =>
    fields.map(({ name }) => name),
  ),
];

export type TBroadcastEmailSettings = Record<string, string | undefined>;

export const useBroadcastEmailCredentials = (
  form: UseFormReturn<TBroadcastEmailSettings>,
) => {
  const isSaas = useVersion('saas');

  const [mode, provider, legacyAccessKey] = useWatch({
    control: form.control,
    name: [
      BROADCAST_MODE_FIELD,
      BROADCAST_PROVIDER_FIELD,
      'BROADCAST_AWS_SES_ACCESS_KEY_ID',
    ],
  });

  const usesOwnCredentials = mode ? mode === 'custom' : !!legacyAccessKey;

  return {
    showCredentials: !isSaas,
    usesOwnCredentials,
    providerFields: BROADCAST_PROVIDER_FIELDS[provider || 'SES'] || [],
  };
};
