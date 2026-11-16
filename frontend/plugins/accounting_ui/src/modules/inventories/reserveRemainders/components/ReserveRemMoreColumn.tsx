import { RecordTable, useConfirm } from 'erxes-ui';
import { Cell } from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { RESERVE_REM_CONTENT_TYPE } from '@/inventories/reserveRemainders/constants/reserveRemPanel';
import { useReserveRemsRemove } from '@/inventories/reserveRemainders/hooks/useReserveRemsRemove';
import { IReserveRem } from '@/inventories/reserveRemainders/types/ReserveRem';
import { MoreActionsCell } from '@/settings/components/SettingsRowsTable';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';

const ReserveRemMoreColumnCell = ({
  cell,
}: {
  cell: Cell<IReserveRem, unknown>;
}) => {
  const { t } = useTranslation('accounting');
  const { confirm } = useConfirm();
  const { openDetail } = useSettingsPanel(RESERVE_REM_CONTENT_TYPE);
  const { removeReserveRems } = useReserveRemsRemove();

  const { _id } = cell.row.original;

  const handleDelete = () =>
    confirm({
      message: t('are-you-sure'),
      options: {
        okLabel: t('delete'),
        cancelLabel: t('cancel'),
      },
    }).then(() => {
      removeReserveRems({ variables: { _ids: [_id] } });
    });

  return (
    <MoreActionsCell onEdit={() => openDetail(_id)} onDelete={handleDelete} />
  );
};

export const reserveRemMoreColumn = {
  id: 'more',
  header: () => <RecordTable.ColumnSelector />,
  cell: ReserveRemMoreColumnCell,
  size: 33,
};
