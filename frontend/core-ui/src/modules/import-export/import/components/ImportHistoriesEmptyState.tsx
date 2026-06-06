import { formatImportExportEntityTypeLabel } from '@/import-export/shared/formatEntityTypeLabel';
import { IconFileImport } from '@tabler/icons-react';
import { Badge, Empty, useQueryState } from 'erxes-ui';
import { useImportHistoriesRecordTable } from './ImportHistoriesContext';

const SELECTED_CONTENT_TYPE_INFO = {
  label: (selectedEntityType: string | null, contentTypes: any[]) =>
    formatImportExportEntityTypeLabel(
      selectedEntityType || 'all',
      contentTypes,
    ),
  title: (label: string | null) => `No ${label} imports yet`,
  emptyDescription: (label: string | null) =>
    `${label} imports will appear here after someone uploads a CSV file. Error files will also be available here whenever a job needs attention.`,
};

const UNSELECTED_CONTENT_TYPE_INFO = {
  label: 'All types',
  title: 'No imports yet',
  emptyDescription:
    'CSV imports started from your modules will appear here with their status, processed rows, and any error files you may need to review.',
};

export const ImportHistoriesEmptyState = () => {
  const [selectedEntityType] = useQueryState<string>('type', {
    defaultValue: 'all',
  });

  const { contentTypes, columnsLength } = useImportHistoriesRecordTable();

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
              <IconFileImport />
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
