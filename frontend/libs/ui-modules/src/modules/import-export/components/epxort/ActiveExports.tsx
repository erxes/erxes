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
        <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
          <IconDownload className="size-5" />
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold">
              Export {entityDisplayName}
            </h3>
            <Badge variant="info">CSV file</Badge>
            {activeCount > 0 && (
              <Badge variant="secondary">{activeCount} active</Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Create a CSV with the fields you choose, then download it once the
            file is ready.
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-muted/20 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium">
              {hasSelection
                ? `Export ${selectionCount} selected ${entityDisplayName.toLowerCase()}`
                : `Export the ${entityDisplayName.toLowerCase()} in this view`}
            </p>
            <p className="text-xs text-muted-foreground">
              {hasSelection
                ? 'Only the currently selected records will be included.'
                : 'We will use the records currently visible with your applied filters.'}
            </p>
          </div>
          <Button onClick={onStartExport}>Choose fields</Button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Recent exports</p>
            <p className="text-xs text-muted-foreground">
              Download completed files or retry failed exports.
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
                <p className="text-sm font-medium">No recent exports yet</p>
                <p className="text-xs text-muted-foreground">
                  Your generated CSV files will show up here so you can download
                  them again or keep track of export progress.
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
          Open export history
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
