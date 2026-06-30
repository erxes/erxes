import { IconAlertCircle } from '@tabler/icons-react';
import { Empty } from 'erxes-ui';
import { useExportHistoriesRecordTable } from './ExportHistoriesContext';
import { useTranslation } from 'react-i18next';

export const ExportHistoriesErrorState = () => {
  const { t } = useTranslation('import-export');
  const { columnsLength } = useExportHistoriesRecordTable();

  return (
    <tr>
      <td colSpan={columnsLength} className="p-0">
        <Empty className="min-h-[22rem] border border-destructive/30 bg-destructive/5">
          <Empty.Header>
            <Empty.Media variant="icon">
              <IconAlertCircle className="text-destructive" />
            </Empty.Media>
            <Empty.Title>{t('export-history-error', "Export history couldn't be loaded")}</Empty.Title>
            <Empty.Description>
              {t('try-refresh', 'Try refreshing this page again in a moment.')}
            </Empty.Description>
          </Empty.Header>
        </Empty>
      </td>
    </tr>
  );
};
