import { RecordTableInlineCell } from 'erxes-ui';
import { useTranslation } from 'react-i18next';

export const SyncedStatusCell = ({ isSynced }: { isSynced?: boolean }) => {
  const { t } = useTranslation('mongolian');
  return (
    <RecordTableInlineCell>
      {isSynced ? (
        <span className="text-green-600 font-medium">{t('synced', 'Synced')}</span>
      ) : (
        <span className="text-gray-400"></span>
      )}
    </RecordTableInlineCell>
  );
};
