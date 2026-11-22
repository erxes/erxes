import type { Integration as ListedIntegration, IntegrationStatus } from '@erxes/core-contract';
import { Badge, cn } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { usePluginText } from '~/modules/plugins/pluginText';
import type { Integration } from './catalog';

const VARIANT = {
  connected: 'success',
  off: 'secondary',
  attention: 'warning',
  'not-set-up': 'secondary',
} as const;

/** "Connected", "Off", "Needs attention" or "Not set up"; nothing while it loads. */
export const IntegrationStatusBadge = ({
  status,
}: {
  status: Pick<IntegrationStatus, 'state'> | null;
}) => {
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

/** The integration's name and one line, in the member's language. */
export const useIntegrationText = () => {
  const { t } = useTranslation('settings', { keyPrefix: 'integrations' });
  const text = usePluginText();

  return (integration: ListedIntegration) =>
    integration.plugin
      ? {
          name: text(integration.plugin, integration.name),
          summary: text(integration.plugin, integration.summary),
        }
      : {
          name: t(`name.${integration.key}`, integration.name),
          summary: t(`catalog.${integration.key}`, integration.summary),
        };
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
      'flex shrink-0 items-center justify-center overflow-hidden rounded-lg border',
      integration.logo ? 'bg-white' : 'bg-muted text-primary-text',
      size === 'lg' ? 'size-14' : 'size-10',
    )}
  >
    <integration.icon
      className={cn(
        integration.logo && (size === 'lg' ? 'size-11' : 'size-8'),
        !integration.logo && (size === 'lg' ? 'size-7 text-xl' : 'size-5 text-base'),
      )}
    />
  </span>
);
