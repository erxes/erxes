import { Cell } from '@tanstack/table-core';
import { AddErxesMessengerSheet } from './AddErxesMessenger';
import { IIntegrationDetail } from '@/integrations/types/Integration';
import { Button } from 'erxes-ui';
import { IconEdit } from '@tabler/icons-react';
import { EditErxesMessengerSheet } from './EditErxesMessengerSheet';
import { useSetAtom } from 'jotai';
import { erxesMessengerSetupEditSheetOpenAtom } from '@/integrations/erxes-messenger/states/erxesMessengerSetupStates';

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
  cell: Cell<IIntegrationDetail, unknown>;
}) => {
  const setEditId = useSetAtom(erxesMessengerSetupEditSheetOpenAtom);
  return (
    <Button variant="outline" onClick={() => setEditId(cell.row.original._id)}>
      <IconEdit />
    </Button>
  );
};
