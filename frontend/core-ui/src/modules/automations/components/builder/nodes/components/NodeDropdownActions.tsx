import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import { AlertDialog, Button, Dialog, DropdownMenu } from 'erxes-ui';
import { Dispatch, SetStateAction } from 'react';
import { AutomationNodesType, NodeData } from '@/automations/types';
import { NodeEditMetaDataForm } from '@/automations/components/builder/nodes/components/NodeEditMetaDataForm';
import { useNodeDropDownActions } from '@/automations/components/builder/nodes/hooks/useNodeDropDownActions';

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
        >
          <IconDotsVertical className="size-4" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content
        className="w-42"
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
  return (
    <AlertDialog open={isOpenRemoveAlert} onOpenChange={setOpenRemoveAlert}>
      <AlertDialog.Trigger asChild>
        <DropdownMenu.Item asChild>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={(e) => e.stopPropagation()}
            onDoubleClick={(e) => e.stopPropagation()}
          >
            <IconTrash className="size-4 text-destructive" />
            Delete
          </Button>
        </DropdownMenu.Item>
      </AlertDialog.Trigger>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>Are you absolutely sure?</AlertDialog.Title>
          <AlertDialog.Description>
            This action cannot be undone.
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer>
          <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
          <AlertDialog.Action onClick={onRemoveNode}>
            Continue
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
            Edit
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
