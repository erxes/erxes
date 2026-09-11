import { formatImportExportEntityTypeLabel } from '@/import-export/shared/formatEntityTypeLabel';
import { TImportExportHistoryType } from '@/import-export/hooks/useImportExportTypes';
import { IconFileExport } from '@tabler/icons-react';
import { Badge, Empty, useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const ExportHistoriesEmptyState = ({
  columnsLength,
  contentTypes,
}: {
  columnsLength: number;
  contentTypes: TImportExportHistoryType[];
}) => {
  const { t } = useTranslation('importExport');
  const [selectedEntityType] = useQueryState<string>('type', {
    defaultValue: 'all',
  });

  const isAllSelected = !selectedEntityType || selectedEntityType === 'all';
  const entity = isAllSelected
    ? ''
    : formatImportExportEntityTypeLabel(selectedEntityType, contentTypes);

  return (
    <tr>
      <td colSpan={columnsLength} className="p-0">
        <Empty className="min-h-[24rem] rounded-xl border bg-muted/20">
          <Empty.Header>
            <Empty.Media variant="icon">
              <IconFileExport />
            </Empty.Media>
            <Empty.Title>
              {isAllSelected
                ? t('no-exports-yet')
                : t('no-entity-exports-yet', { entity })}
            </Empty.Title>
            <Empty.Description>
              {isAllSelected
                ? t('no-exports-yet-description')
                : t('no-entity-exports-yet-description', { entity })}
            </Empty.Description>
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
