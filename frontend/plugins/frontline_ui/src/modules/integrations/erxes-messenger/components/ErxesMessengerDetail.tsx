import { CellContext } from '@tanstack/react-table';
import { AddErxesMessengerSheet } from './AddErxesMessenger';
import { IIntegrationDetail } from '@/integrations/types/Integration';
import { IconEdit } from '@tabler/icons-react';
import { EditErxesMessengerSheet } from './EditErxesMessengerSheet';
import { useSetAtom } from 'jotai';
import { erxesMessengerSetupEditSheetOpenAtom } from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';
import { useTranslation } from 'react-i18next';
export const ErxesMessengerDetail = () => {
  return (
    <>
      <AddErxesMessengerSheet />
      <EditErxesMessengerSheet />
    </>
  );
};

export const ErxesMessengerActions = ({
  cell,
}: {
  cell: CellContext<IIntegrationDetail, unknown>;
}) => {
  const { t } = useTranslation('frontline');
  const setEditId = useSetAtom(erxesMessengerSetupEditSheetOpenAtom);
  return (
    <div className="flex flex-col gap-2 w-full">
      <div
        onClick={() => setEditId(cell.row.original._id)}
        className="flex items-center gap-2 w-full cursor-pointer"
      >
        <IconEdit size={16} />
        {t('edit')}
      </div>
    </div>
  );
};
