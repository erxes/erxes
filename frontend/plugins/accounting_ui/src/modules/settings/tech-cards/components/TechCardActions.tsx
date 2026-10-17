import { useTranslation } from 'react-i18next';
import { useConfirm, useQueryState } from 'erxes-ui';
import { MoreActionsCell } from '../../components/SettingsRowsTable';
import { useTechCardRemove } from '../hooks/useTechCardMutations';

export const TechCardActions = ({ cardId }: { cardId: string }) => {
  const { t } = useTranslation('accounting');
  const [, setOpen] = useQueryState<string>('tech_card_id');
  const { confirm } = useConfirm();
  const { removeTechCard } = useTechCardRemove();

  const handleDelete = () => {
    void confirm({
      message: t('tech-card-confirm-delete'),
      options: { okLabel: t('delete'), cancelLabel: t('cancel') },
    }).then(() => {
      void removeTechCard({ variables: { _id: cardId } });
    });
  };

  return (
    <MoreActionsCell onEdit={() => setOpen(cardId)} onDelete={handleDelete} />
  );
};
