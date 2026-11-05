import { useTranslation } from 'react-i18next';
import { useConfirm } from 'erxes-ui';
import { MoreActionsCell } from '@/settings/components/SettingsRowsTable';
import { JOB_CONTENT_TYPE } from '@/settings/constants/settingsPanel';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';
import { useJobRemove } from '@/settings/jobs/hooks/useJobMutations';

export const JobActions = ({ cardId }: { cardId: string }) => {
  const { t } = useTranslation('accounting');
  const { openDetail } = useSettingsPanel(JOB_CONTENT_TYPE);
  const { confirm } = useConfirm();
  const { removeJob } = useJobRemove();

  const handleDelete = () => {
    void confirm({
      message: t('job-confirm-delete'),
      options: { okLabel: t('delete'), cancelLabel: t('cancel') },
    }).then(() => {
      void removeJob({ variables: { _id: cardId } });
    });
  };

  return (
    <MoreActionsCell
      onEdit={() => openDetail(cardId)}
      onDelete={handleDelete}
    />
  );
};
