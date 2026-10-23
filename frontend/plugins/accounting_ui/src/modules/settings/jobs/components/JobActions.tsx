import { useTranslation } from 'react-i18next';
import { useConfirm, useQueryState } from 'erxes-ui';
import { MoreActionsCell } from '../../components/SettingsRowsTable';
import { useJobRemove } from '../hooks/useJobMutations';

export const JobActions = ({ cardId }: { cardId: string }) => {
  const { t } = useTranslation('accounting');
  const [, setOpen] = useQueryState<string>('job_id');
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
    <MoreActionsCell onEdit={() => setOpen(cardId)} onDelete={handleDelete} />
  );
};
