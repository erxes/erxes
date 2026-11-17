import { INTEGRATIONS } from '@/integrations/constants/integrations';
import { IntegrationType } from '@/types/Integration';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { currentOrganizationState } from 'ui-modules';

export const INTEGRATIONS_CONFIG_PATH = 'frontline/settings/config';

const CONFIG_PROVIDERS = [
  {
    segment: 'facebook',
    kind: IntegrationType.FACEBOOK_MESSENGER,
    label: 'Facebook',
    selfHostedOnly: true,
  },
  {
    segment: 'instagram',
    kind: IntegrationType.INSTAGRAM_MESSENGER,
    label: 'Instagram',
    selfHostedOnly: true,
  },
  {
    segment: 'telegram',
    kind: IntegrationType.TELEGRAM_MESSENGER,
    label: 'Telegram',
    selfHostedOnly: false,
  },
  {
    segment: 'call',
    kind: IntegrationType.CALL,
    label: 'Call',
    selfHostedOnly: false,
  },
  {
    segment: 'mail',
    kind: IntegrationType.MAIL,
    label: 'Email',
    selfHostedOnly: false,
  },
] as const;

export type TConfigProviderSegment =
  (typeof CONFIG_PROVIDERS)[number]['segment'];

export type TConfigProvider = {
  segment: TConfigProviderSegment;
  label: string;
  img: string;
};

export const useConfigProviders = (): TConfigProvider[] => {
  const organization = useAtomValue(currentOrganizationState);
  const isSaas = organization?.type === 'saas';

  return useMemo(
    () =>
      CONFIG_PROVIDERS.filter(
        (provider) => !(isSaas && provider.selfHostedOnly),
      ).map(({ segment, kind, label }) => ({
        segment,
        label,
        img: INTEGRATIONS[kind].img,
      })),
    [isSaas],
  );
};
