import { IconAlertCircle } from '@tabler/icons-react';
import { Empty } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const ImportHistoriesErrorState = ({
  columnsLength,
}: {
  columnsLength: number;
}) => {
  const { t } = useTranslation('importExport');

  return (
    <tr>
      <td colSpan={columnsLength} className="p-0">
        <Empty className="min-h-[22rem] border border-destructive/30 bg-destructive/5">
          <Empty.Header>
            <Empty.Media variant="icon">
              <IconAlertCircle className="text-destructive" />
            </Empty.Media>
            <Empty.Title>{t('import-history-load-failed')}</Empty.Title>
            <Empty.Description>{t('try-again-later')}</Empty.Description>
          </Empty.Header>
        </Empty>
      </td>
    </tr>
  );
};
