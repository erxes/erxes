import { NodeEditMetaDataForm } from '@/automations/components/builder/nodes/components/NodeEditMetaDataForm';
import { NodeData } from '@/automations/types';
import {
    IconEdit
} from '@tabler/icons-react';
import { Button, Dialog, DropdownMenu } from 'erxes-ui';
import { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';

export const NodeEditMetaDataDialog = ({
  isOpenDialog,
  setOpenDialog,
  data,
  id,
}: {
  isOpenDialog: boolean;
  setOpenDialog: Dispatch<SetStateAction<boolean>>;
  data: NodeData;
  id: string;
}) => {
  const { t } = useTranslation('automations');
  return (
    <Dialog open={isOpenDialog} onOpenChange={setOpenDialog}>
      <Dialog.Trigger asChild>
        <DropdownMenu.Item asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
          >
            <IconEdit className="size-4" />
            {t('edit')}
          </Button>
        </DropdownMenu.Item>
      </Dialog.Trigger>
      <NodeEditMetaDataForm
        id={id}
        data={data}
        callback={() => setOpenDialog(false)}
      />
    </Dialog>
  );
};
