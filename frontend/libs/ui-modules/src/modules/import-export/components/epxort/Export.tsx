import { IconDownload } from '@tabler/icons-react';
import { VariantProps } from 'class-variance-authority';
import { Button, buttonVariants } from 'erxes-ui';
import { useState } from 'react';
import { useExport } from '../../hooks/export/useExport';
import { formatEntityLabel } from '../../utils/entityLabel';
import { ActiveExportsPopover } from './ActiveExports';
import { ExportFieldSelection } from './ExportFieldSelection';

export const Export = ({
  pluginName,
  moduleName,
  collectionName,
  buttonVariant = 'outline',
  ids,
  getFilters,
  confirmMessage = 'Create this CSV export with the selected fields?',
}: {
  pluginName: string;
  moduleName: string;
  collectionName: string;
  buttonVariant?: VariantProps<typeof buttonVariants>['variant'];
  ids?: string[];
  getFilters?: () => Record<string, any>;
  confirmMessage?: string;
}) => {
  const [fieldSelectionOpen, setFieldSelectionOpen] = useState(false);
  const entityType = `${pluginName}:${moduleName}.${collectionName}`;
  const entityDisplayName = formatEntityLabel(collectionName, {
    plural: true,
    capitalize: true,
  });
  const { loading, onFieldSelectionConfirm } = useExport({
    entityType,
    ids,
    getFilters,
    confirmMessage,
  });

  return (
    <>
      <div className="flex items-center">
        <Button
          variant={buttonVariant}
          disabled={loading}
          onClick={() => setFieldSelectionOpen(true)}
          className="border-r-0 rounded-r-none"
        >
          <IconDownload />
          Export
        </Button>
        <ActiveExportsPopover
          buttonVariant={buttonVariant}
          entityType={entityType}
          entityDisplayName={entityDisplayName}
          selectionCount={ids?.length}
          onStartExport={() => setFieldSelectionOpen(true)}
        />
      </div>

      <ExportFieldSelection
        entityType={entityType}
        open={fieldSelectionOpen}
        onOpenChange={setFieldSelectionOpen}
        onConfirm={onFieldSelectionConfirm}
        recordCount={ids?.length}
        entityDisplayName={entityDisplayName}
      />
    </>
  );
};
