import { useTranslation } from 'react-i18next';
import {
  IconArrowRight,
  IconChevronDown,
  IconDownload,
  IconHistory,
} from '@tabler/icons-react';
import { Button, buttonVariants, Popover, Spinner } from 'erxes-ui';
import { Badge } from 'erxes-ui/components/badge';
import { VariantProps } from 'class-variance-authority';
import { Link } from 'react-router-dom';
import { ExportProgress } from './ExportProgress';
import { useActiveExports } from '../../hooks/export/useActiveExports';

export const ActiveExports = ({
  entityType,
  entityDisplayName,
  selectionCount,
  onStartExport,
}: {
  entityType: string;
  entityDisplayName: string;
  selectionCount?: number;
  onStartExport: () => void;
}) => {
  const { t } = useTranslation('importExport');

  const { activeExports, handleRetry, loading } = useActiveExports({
    entityType,
  });

  const activeCount = activeExports.filter((exportItem) =>
    ['pending', 'validating', 'processing'].includes(exportItem.status),
  ).length;
  const hasSelection = !!selectionCount;

  return (
    <div className="space-y-5">
      <div className="flex items-start gap-3">
        <div className="shrink-0 rounded-xl bg-primary/10 p-2.5 text-primary">
          <IconDownload className="size-5" />
        </div>
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold">
              {t('export-entity', { entity: entityDisplayName })}
            </h3>
            <Badge variant="info">{t('csv-file')}</Badge>
            {activeCount > 0 && (
              <Badge variant="secondary">
                {t('active-count', { total: activeCount })}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {t('export-popover-description')}
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-muted/20 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">
              {hasSelection
                ? t('export-selected', {
                    total: selectionCount,
                    entity: entityDisplayName.toLowerCase(),
                  })
                : t('export-in-view', {
                    entity: entityDisplayName.toLowerCase(),
                  })}
            </p>
            <p className="text-xs text-muted-foreground">
              {hasSelection
                ? t('export-selected-hint')
                : t('export-in-view-hint')}
            </p>
          </div>
          <Button onClick={onStartExport}>{t('choose-fields')}</Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">{t('recent-exports')}</p>
            <p className="text-xs text-muted-foreground">
              {t('recent-exports-description')}
            </p>
          </div>
          {activeExports.length > 0 && (
            <Badge variant="secondary">{activeExports.length}</Badge>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center rounded-xl border bg-muted/20 p-6">
            <Spinner />
          </div>
        ) : activeExports.length === 0 ? (
          <div className="rounded-xl border bg-muted/20 p-5">
            <div className="flex items-start gap-3">
              <div className="rounded-full bg-background p-2 shadow-sm">
                <IconHistory className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{t('no-recent-exports')}</p>
                <p className="text-xs text-muted-foreground">
                  {t('no-recent-exports-description')}
                </p>
              </div>
            </div>
          </div>
        ) : (
          activeExports.map((activeExport) => (
            <ExportProgress
              key={activeExport._id}
              exportItem={activeExport}
              onRetry={handleRetry}
            />
          ))
        )}
      </div>

      <Button asChild variant="outline" className="w-full justify-between">
        <Link to="/settings/import-export/export">
          {t('open-export-history')}
          <IconArrowRight className="size-4" />
        </Link>
      </Button>
    </div>
  );
};

export const ActiveExportsPopover = ({
  buttonVariant,
  entityType,
  entityDisplayName,
  selectionCount,
  onStartExport,
}: {
  buttonVariant: VariantProps<typeof buttonVariants>['variant'];
  entityType: string;
  entityDisplayName: string;
  selectionCount?: number;
  onStartExport: () => void;
}) => {
  const { t } = useTranslation('importExport');

  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button
          variant={buttonVariant}
          size="icon"
          className="border-l-0 rounded-l-none "
        >
          <IconChevronDown />
        </Button>
      </Popover.Trigger>
      <Popover.Content align="end" className="w-[460px] p-5">
        <ActiveExports
          entityType={entityType}
          entityDisplayName={entityDisplayName}
          selectionCount={selectionCount}
          onStartExport={onStartExport}
        />
      </Popover.Content>
    </Popover>
  );
};
