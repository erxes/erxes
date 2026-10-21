import {
  IconAlertTriangle,
  IconArchive,
  IconArrowBack,
  IconAutomation,
  IconCreditCard,
  IconExternalLink,
  IconLoader2,
  IconShoppingCart,
} from '@tabler/icons-react';
import { Alert, Button, DropdownMenu, useConfirm } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { useBoardArchive } from '@/deals/boards/hooks/useBoardArchive';
import type { IBoard } from '@/deals/types/boards';

export const BoardArchiveMenuItem = ({
  board,
  disabled,
}: {
  board: IBoard;
  disabled?: boolean;
}): JSX.Element => {
  const { t } = useTranslation('sales');
  const { confirm } = useConfirm();
  const { archiveBoard, confirmArchive, loading } = useBoardArchive();
  const restoring = board.status === 'archived';
  const label = restoring
    ? t('unarchive-board', 'Unarchive board')
    : t('archive-board', 'Archive board');

  const onClick = async (): Promise<void> => {
    const preview = await archiveBoard(board);
    if (!preview) return;
    const connections = [
      {
        count: preview.automationCount ?? 0,
        icon: IconAutomation,
        label: t('board-archive-automations-warning', {
          defaultValue: '{{count}} active automations',
          count: preview.automationCount ?? 0,
        }),
        description: t(
          'board-archive-automations-continue',
          'Automations and pending runs will stay enabled.',
        ),
        href: '/automations',
        linkLabel: t('review-automations', 'Review automations'),
      },
      {
        count: preview.posCount ?? 0,
        icon: IconShoppingCart,
        label: t('board-archive-pos-warning', {
          defaultValue: '{{count}} POS systems',
          count: preview.posCount ?? 0,
        }),
        description: t(
          'board-archive-pos-description',
          'Deal sync or delivery settings point to this board.',
        ),
        href: '/settings/sales/pos',
        linkLabel: t('review-pos-settings', 'Review POS settings'),
      },
      {
        count: preview.paymentCount ?? 0,
        icon: IconCreditCard,
        label: t('board-archive-payments-warning', {
          defaultValue: '{{count}} configured payment methods',
          count: preview.paymentCount ?? 0,
        }),
        description: t(
          'board-archive-payments-description',
          'Configured on pipelines in this board. Invoices are not counted.',
        ),
        href: `/settings/sales/deals?activeBoardId=${encodeURIComponent(
          board._id,
        )}`,
        linkLabel: t('review-pipeline-settings', 'Review pipeline settings'),
      },
    ].filter(({ count }) => count > 0);
    const hasConnections = connections.length > 0;

    void confirm({
      message: t(
        restoring ? 'unarchive-board-confirm' : 'archive-board-confirm',
        {
          defaultValue: restoring
            ? 'Unarchive "{{name}}"?'
            : 'Archive "{{name}}"?',
          name: preview.board.name,
        },
      ),
      options: {
        confirmationValue: restoring ? undefined : 'archive',
        okLabel: restoring
          ? t('unarchive', 'Unarchive')
          : hasConnections
          ? t('archive-anyway', 'Archive anyway')
          : t('archive', 'Archive'),
        cancelLabel: t('cancel', 'Cancel'),
        description: restoring
          ? t(
              'board-unarchive-description',
              'This will unarchive the board only. Pipelines and deals will stay archived and can be unarchived separately.',
            )
          : t('board-archive-counts', {
              defaultValue:
                '{{pipelines}} pipelines and {{deals}} deals will be archived. Nothing will be deleted.',
              pipelines: (preview.pipelineCount ?? 0).toLocaleString(),
              deals: (preview.dealCount ?? 0).toLocaleString(),
            }),
        content: hasConnections ? (
          <div className="space-y-4 text-sm">
            <section
              aria-label={t(
                'board-archive-connected-services',
                'Connected services',
              )}
            >
              <h3 className="mb-2 font-medium">
                {t('board-archive-connected-services', 'Connected services')}
              </h3>
              <ul className="divide-y rounded-lg border px-3">
                {connections.map(
                  ({ icon: Icon, label, description, href, linkLabel }) => (
                    <li key={href} className="flex items-start gap-3 py-3">
                      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                      <div className="min-w-0 flex-1 space-y-1">
                        <p className="font-medium leading-5">{label}</p>
                        <p className="text-xs leading-5 text-muted-foreground">
                          {description}
                        </p>
                      </div>
                      <Button
                        asChild
                        variant="ghost"
                        size="sm"
                        className="mt-0.5 shrink-0 text-primary"
                      >
                        <a
                          href={href}
                          aria-label={linkLabel}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {t('board-archive-review', 'Review')}
                          <IconExternalLink aria-hidden="true" />
                        </a>
                      </Button>
                    </li>
                  ),
                )}
              </ul>
            </section>
            <Alert variant="warning" className="border-warning/30 bg-warning/5">
              <IconAlertTriangle aria-hidden="true" />
              <Alert.Title className="line-clamp-none text-foreground">
                {t(
                  'board-archive-blocked-title',
                  'Deal changes will be blocked',
                )}
              </Alert.Title>
              <Alert.Description className="text-foreground/80">
                <p>
                  {t(
                    'board-archive-connections-continue',
                    'Connections will be kept, but these services cannot create or update deals in the archived board. Review their settings before continuing.',
                  )}
                </p>
              </Alert.Description>
            </Alert>
          </div>
        ) : null,
      },
    }).then(() => confirmArchive(preview));
  };

  const icon = loading ? (
    <IconLoader2 className="size-4 animate-spin" />
  ) : restoring ? (
    <IconArrowBack className="size-4" />
  ) : (
    <IconArchive className="size-4" />
  );

  return (
    <DropdownMenu.Item
      disabled={disabled || loading}
      onSelect={() => void onClick()}
    >
      {icon}
      {label}
    </DropdownMenu.Item>
  );
};
