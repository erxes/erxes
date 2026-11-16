import { Badge, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { GATEWAY_PAYS } from '../payments/gatewayCatalog';
import type { Integration } from './catalog';
import type { IntegrationStatus } from './useIntegrationStatus';

const VARIANT = {
  connected: 'success',
  off: 'secondary',
  attention: 'warning',
  'not-set-up': 'secondary',
} as const;

/** "Connected", "Off", "Needs attention" or "Not set up"; nothing while it loads. */
export const IntegrationStatusBadge = ({ status }: { status: IntegrationStatus | null }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });

  if (!status) return null;

  const label = {
    connected: t('connected', 'Connected'),
    off: t('off', 'Off'),
    attention: t('attention', 'Needs attention'),
    'not-set-up': t('not-set-up', 'Not set up'),
  }[status.state];

  return <Badge variant={VARIANT[status.state]}>{label}</Badge>;
};

/** The integration's one line: what it does, or how a gateway's payers pay. */
export const useIntegrationSummary = () => {
  const { t } = useTranslation('settings');

  return (integration: Integration) =>
    integration.kind === 'gateway'
      ? t(`payments.pays-${GATEWAY_PAYS[integration.gateway]}`)
      : t(`integrations.catalog.${integration.key}`, integration.summary);
};

/** The integration's mark in a square, as tiles and its page show it. */
export const IntegrationMark = ({
  integration,
  size = 'md',
}: {
  integration: Integration;
  size?: 'md' | 'lg';
}) => (
  <span
    className={cn(
      'flex shrink-0 items-center justify-center rounded-lg border bg-muted text-primary-text',
      size === 'lg' ? 'size-14' : 'size-10',
    )}
  >
    <integration.icon className={size === 'lg' ? 'size-7' : 'size-5'} />
  </span>
);
