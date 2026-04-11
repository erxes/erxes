import { formatImportExportEntityTypeLabel } from '@/import-export/shared/formatEntityTypeLabel';
import { IconFileExport } from '@tabler/icons-react';
import { Badge, Empty, useQueryState } from 'erxes-ui';
import { useExportHistoriesRecordTable } from './ExportHistoriesContext';

const SELECTED_CONTENT_TYPE_INFO = {
  label: (selectedEntityType: string | null, contentTypes: any[]) =>
    formatImportExportEntityTypeLabel(
      selectedEntityType || 'all',
      contentTypes,
    ),
  title: (label: string | null) => `No ${label} exports yet`,
  emptyDescription: (label: string | null) =>
    `${label} exports will appear here after someone downloads records in that section. Completed files can be downloaded again from this page.`,
};

const UNSELECTED_CONTENT_TYPE_INFO = {
  label: 'All types',
  title: 'No exports yet',
  emptyDescription:
    'CSV exports will appear here after someone downloads records from a module. Completed files can be downloaded again from this page.',
};

export const ExportHistoriesEmptyState = () => {
  const [selectedEntityType] = useQueryState<string>('type', {
    defaultValue: 'all',
  });

  const { contentTypes, columnsLength } = useExportHistoriesRecordTable();

  const isAllSelected = selectedEntityType === 'all';

  const label = isAllSelected
    ? UNSELECTED_CONTENT_TYPE_INFO.label
    : SELECTED_CONTENT_TYPE_INFO.label(selectedEntityType, contentTypes);

  const emptyTitle = isAllSelected
    ? UNSELECTED_CONTENT_TYPE_INFO.title
    : SELECTED_CONTENT_TYPE_INFO.title(label);

  const emptyDescription = isAllSelected
    ? UNSELECTED_CONTENT_TYPE_INFO.emptyDescription
    : SELECTED_CONTENT_TYPE_INFO.emptyDescription(label);

  return (
    <tr>
      <td colSpan={columnsLength} className="p-0">
        <Empty className="min-h-[24rem] rounded-xl border bg-muted/20">
          <Empty.Header>
            <Empty.Media variant="icon">
              <IconFileExport />
            </Empty.Media>
            <Empty.Title>{emptyTitle}</Empty.Title>
            <Empty.Description>{emptyDescription}</Empty.Description>
          </Empty.Header>
          {!!contentTypes.length && (
            <Empty.Content>
              <div className="flex flex-wrap justify-center gap-2">
                {contentTypes.map(({ contentType, label }) => (
                  <Badge key={contentType} variant="secondary">
                    {label}
                  </Badge>
                ))}
              </div>
            </Empty.Content>
          )}
        </Empty>
      </td>
    </tr>
  );
};
