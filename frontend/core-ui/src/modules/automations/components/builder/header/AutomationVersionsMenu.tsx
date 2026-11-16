import { useAutomationVersionsMenu } from '@/automations/components/builder/hooks/useAutomationVersionsMenu';
import { TRestoreStatus } from '@/automations/utils/automationVersions';
import { IconArrowBackUp, IconHistory } from '@tabler/icons-react';
import {
  Badge,
  BadgeProps,
  Button,
  Dialog,
  IconComponent,
  Popover,
  RelativeDateDisplay,
  Skeleton,
  Spinner,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';

const STATUS_BADGE: Record<TRestoreStatus, BadgeProps['variant']> = {
  same: 'secondary',
  changed: 'warning',
  added: 'success',
  removed: 'destructive',
};

const AutomationVersionRestorePreview = ({
  preview,
}: {
  preview: ReturnType<typeof useAutomationVersionsMenu>['preview'];
}) => {
  const { t } = useTranslation('automations');

  return (
    <Dialog
      open={preview.isOpen}
      onOpenChange={(open) => !open && preview.close()}
    >
      <Dialog.ContentCombined
        className="max-w-lg"
        title={t('versions-preview-title', { version: preview.version ?? '' })}
        description={t('versions-preview-description')}
      >
        <div className="max-h-96 overflow-y-auto px-4">
          {preview.loading && <Skeleton className="h-24 w-full" />}
          {!preview.loading && (
            <ul>
              {preview.steps.map((step) => (
                <li
                  key={step.id}
                  className="flex items-center gap-2 border-b py-2 text-sm last:border-b-0"
                >
                  <IconComponent
                    name={step.icon || 'IconPointerBolt'}
                    className="size-4 shrink-0 text-muted-foreground"
                  />
                  <span className="min-w-0 flex-1 truncate">{step.label}</span>
                  <Badge variant={STATUS_BADGE[step.status]}>
                    {step.statusLabel}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
          {!preview.loading && !preview.hasChanges && (
            <p className="py-2 text-sm text-muted-foreground">
              {t('versions-preview-same')}
            </p>
          )}
        </div>
        <Dialog.Footer>
          <Button variant="outline" onClick={preview.close}>
            {t('cancel')}
          </Button>
          {preview.hasChanges && (
            <Button onClick={preview.confirm}>
              <IconArrowBackUp />
              {t('versions-restore')}
            </Button>
          )}
        </Dialog.Footer>
      </Dialog.ContentCombined>
    </Dialog>
  );
};

export const AutomationVersionsMenu = () => {
  const { t } = useTranslation('automations');
  const {
    isVisible,
    open,
    setOpen,
    loading,
    isEmpty,
    rows,
    openPreview,
    preview,
  } = useAutomationVersionsMenu();

  if (!isVisible) {
    return null;
  }

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <Button variant="outline">
            <IconHistory />
            {t('versions')}
          </Button>
        </Popover.Trigger>
        <Popover.Content align="end" className="w-80 p-0">
          <div className="border-b px-4 py-3">
            <p className="text-sm font-medium">{t('versions')}</p>
            <p className="text-xs text-muted-foreground">
              {t('versions-description')}
            </p>
          </div>
          {loading && <Spinner className="py-6" />}
          {!loading && isEmpty && (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              {t('versions-empty')}
            </p>
          )}
          <ul className="max-h-80 overflow-y-auto">
            {rows.map(({ version, isLatest, summary, canRestore }) => (
              <li
                key={version._id}
                className="flex items-center gap-2 border-b px-4 py-2 text-sm last:border-b-0"
              >
                <span className="font-medium">v{version.version}</span>
                {isLatest && (
                  <Badge variant="secondary">{t('versions-saved')}</Badge>
                )}
                <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                  {summary}
                </span>
                {version.createdAt && (
                  <RelativeDateDisplay value={version.createdAt} asChild>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      <RelativeDateDisplay.Value value={version.createdAt} />
                    </span>
                  </RelativeDateDisplay>
                )}
                {canRestore && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-7 shrink-0"
                    aria-label={t('versions-preview-open')}
                    onClick={() => openPreview(version._id)}
                  >
                    <IconArrowBackUp className="size-4" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </Popover.Content>
      </Popover>
      <AutomationVersionRestorePreview preview={preview} />
    </>
  );
};
