import { IconAlertCircle } from '@tabler/icons-react';
import { Empty } from 'erxes-ui';
import { useImportHistoriesRecordTable } from './ImportHistoriesContext';
import { useTranslation } from 'react-i18next';

export const ImportHistoriesErrorState = () => {
  const { t } = useTranslation('import-export');
  const { columnsLength } = useImportHistoriesRecordTable();
  return (
    <tr>
      <td colSpan={columnsLength} className="p-0">
        <Empty className="min-h-[22rem] border border-destructive/30 bg-destructive/5">
          <Empty.Header>
            <Empty.Media variant="icon">
              <IconAlertCircle className="text-destructive" />
            </Empty.Media>
            <Empty.Title>{t('import-history-error', "Import history couldn't be loaded")}</Empty.Title>
            <Empty.Description>
              {t('try-refresh', 'Try refreshing this page again in a moment.')}
            </Empty.Description>
          </Empty.Header>
        </Empty>
      </td>
    </tr>
  );
};
