import { IconDots, IconEdit, IconTrash } from '@tabler/icons-react';
import { AlertDialog, Button, Dialog, DropdownMenu } from 'erxes-ui';
import { Dispatch, SetStateAction } from 'react';
import { AutomationNodesType, NodeData } from '@/automations/types';
import { NodeEditMetaDataForm } from '@/automations/components/builder/nodes/components/NodeEditMetaDataForm';
import { useNodeDropDownActions } from '@/automations/components/builder/nodes/hooks/useNodeDropDownActions';
import { useTranslation } from 'react-i18next';

export const NodeDropdownActions = ({
  id,
  data,
}: {
  id: string;
  data: NodeData;
}) => {
  const {
    fieldName,
    isOpenDialog,
    isOpenDropDown,
    isOpenRemoveAlert,
    setOpenRemoveAlert,
    setOpenDialog,
    setOpenDropDown,
    onRemoveNode,
  } = useNodeDropDownActions(id, data.nodeType);

  return (
    <DropdownMenu
      open={isOpenDropDown || isOpenDialog || isOpenRemoveAlert}
      onOpenChange={(open) => {
        if (!isOpenDialog && !isOpenRemoveAlert) {
          setOpenDropDown(open);
        }
      }}
    >
      <DropdownMenu.Trigger asChild>
        <Button
          variant="ghost"
          onClick={(e) => e.stopPropagation()}
          onDoubleClick={(e) => e.stopPropagation()}
          size={'icon'}
          className="data-[state=open]:bg-accent-foreground/10"
        >
          <IconDots className="size-4" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        align="start"
        className="w-[100px] min-w-0 [&>button]:cursor-pointer"
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        <NodeEditMetaDataDialog
          isOpenDialog={isOpenDialog}
          setOpenDialog={setOpenDialog}
          data={data}
          id={id}
          fieldName={fieldName}
        />
        <NodeRemoveActionDialog
          onRemoveNode={onRemoveNode}
          isOpenRemoveAlert={isOpenRemoveAlert}
          setOpenRemoveAlert={setOpenRemoveAlert}
        />
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

export const NodeRemoveActionDialog = ({
  onRemoveNode,
  isOpenRemoveAlert,
  setOpenRemoveAlert,
}: {
  onRemoveNode: () => void;
  isOpenRemoveAlert: boolean;
  setOpenRemoveAlert: Dispatch<SetStateAction<boolean>>;
}) => {
  const { t } = useTranslation('automations');
  return (
    <AlertDialog open={isOpenRemoveAlert} onOpenChange={setOpenRemoveAlert}>
      <AlertDialog.Trigger asChild>
        <DropdownMenu.Item asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-destructive"
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
          >
            <IconTrash className="size-4" />
            {t('delete')}
          </Button>
        </DropdownMenu.Item>
      </AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>{t('delete-confirm-title')}</AlertDialog.Title>
          <AlertDialog.Description>
            {t('delete-confirm-description')}
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel>{t('cancel')}</AlertDialog.Cancel>
          <AlertDialog.Action onClick={onRemoveNode}>
            {t('continue')}
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
};

const NodeEditMetaDataDialog = ({
  isOpenDialog,
  setOpenDialog,
  data,
  id,
  fieldName,
}: {
  isOpenDialog: boolean;
  setOpenDialog: Dispatch<SetStateAction<boolean>>;
  data: NodeData;
  id: string;
  fieldName:
    | AutomationNodesType.Triggers
    | AutomationNodesType.Actions
    | AutomationNodesType.Workflows;
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
        fieldName={fieldName}
        data={data}
        callback={() => setOpenDialog(false)}
      />
    </Dialog>
  );
};
