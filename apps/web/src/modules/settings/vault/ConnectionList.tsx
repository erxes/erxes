import type { VaultConnection } from '@erxes/core-contract';
import { IconChevronRight } from '@tabler/icons-react';
import { Badge, cn, CONNECTION_CONTENT_TYPE, useCurrentRecord, useOpenRecord } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import type { Integration } from '../integrations/catalog';
import { useIntegrationText } from '../integrations/IntegrationStatusBadge';

export const ConnectionList = ({
  rows,
  showService,
}: {
  rows: { connection: VaultConnection; integration: Integration }[];
  showService: boolean;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'vault' });
  const { t: connectionT } = useTranslation('settings', { keyPrefix: 'integrations.connection' });
  const text = useIntegrationText();
  const { open } = useOpenRecord();
  const current = useCurrentRecord();

  return (
    <ul className="divide-y rounded-lg border">
      {rows.map(({ connection, integration }) => {
        const off = connection.status === 'disabled';

        const shown =
          current?.contentType === CONNECTION_CONTENT_TYPE && current.contentId === connection.id;

        return (
          <li key={connection.id}>
            <button
              type="button"
              aria-current={shown ? 'true' : undefined}
              className={cn(
                'flex w-full items-center gap-3 p-3 text-left text-sm transition-colors hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary',
                shown && 'bg-accent',
              )}
              onClick={() =>
                open({ contentType: CONNECTION_CONTENT_TYPE, contentId: connection.id })
              }
            >
              <integration.icon className="size-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-2">
                  <span className={cn('font-medium', off && 'text-muted-foreground')}>
                    {connection.name}
                  </span>
                  {off && <Badge>{connectionT('off-badge', 'off')}</Badge>}
                  {connection.problem && (
                    <Badge variant="warning">
                      {connectionT('attention-badge', 'needs attention')}
                    </Badge>
                  )}
                  {connection.settings.sandbox === true && (
                    <Badge variant="warning">{connectionT('sandbox-badge', 'sandbox')}</Badge>
                  )}
                </span>
                {showService && (
                  <span className="block text-xs text-muted-foreground">
                    {text(integration).name}
                  </span>
                )}
                {connection.problem && (
                  <span className="block text-xs text-warning-text">{connection.problem}</span>
                )}
              </span>
              <span className="hidden max-w-56 truncate text-xs text-muted-foreground sm:block">
                {connection.usedBy.length
                  ? t('used-by-list', 'Used by {{names}}', { names: connection.usedBy.join(', ') })
                  : t('used-by-nothing', 'Not in use')}
              </span>
              <IconChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </button>
          </li>
        );
      })}
    </ul>
  );
};
