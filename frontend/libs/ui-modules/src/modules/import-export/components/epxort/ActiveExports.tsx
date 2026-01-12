import { IconChevronDown } from '@tabler/icons-react';
import { Button, buttonVariants, Popover, Spinner } from 'erxes-ui';
import { ExportProgress } from './ExportProgress';
import { useActiveExports } from '../../hooks/export/useActiveExports';
import { VariantProps } from 'class-variance-authority';
import { Link } from 'react-router-dom';

export const ActiveExports = ({ entityType }: { entityType: string }) => {
  const { activeExports, handleRetry, loading } = useActiveExports({
    entityType,
  });

  if (loading) {
    return <Spinner />;
  }

  if (activeExports.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-muted-foreground">No recent exports</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-base font-semibold">Recent Exports</h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Track, download, and manage your exported files.
        </p>
      </div>
      <div className="space-y-2">
        {activeExports.map((activeExport) => (
          <ExportProgress
            key={activeExport._id}
            exportItem={activeExport}
            onRetry={handleRetry}
          />
        ))}
      </div>
      <Button asChild variant="outline" className="w-full">
        <Link to="/import-export/export">See all exports</Link>
      </Button>
    </div>
  );
};

export const ActiveExportsPopover = ({
  buttonVariant,
  entityType,
}: {
  buttonVariant: VariantProps<typeof buttonVariants>['variant'];
  entityType: string;
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
      <Popover.Content className="p-6 w-[500px]">
        <ActiveExports entityType={entityType} />
      </Popover.Content>
    </Popover>
  );
};
