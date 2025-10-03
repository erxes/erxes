import { useNodeDropDownActions } from './hooks/useNodeDropDownActions';
import { IconDotsVertical, IconEdit, IconTrash } from '@tabler/icons-react';
import { AlertDialog, Button, Dialog, DropdownMenu } from 'erxes-ui';
import { Dispatch, SetStateAction } from 'react';
import { AutomationNodesType, NodeData } from '../../../types';
import { EditForm } from './NodeEditForm';

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
    setOpenDialog,
    setOpenDropDown,
    onRemoveNode,
  } = useNodeDropDownActions(id, data.nodeType);

  return (
    <DropdownMenu
      open={isOpenDropDown || isOpenDialog}
      onOpenChange={(open) => {
        if (!isOpenDialog) {
          setOpenDropDown(open);
        }
      }}
    >
      <DropdownMenu.Trigger asChild>
        <Button variant="ghost">
          <IconDotsVertical className="size-4" />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content className="w-42">
        <DropdownMenu.Item asChild>
          <NodeEditForm
            isOpenDialog={isOpenDialog}
            setOpenDialog={setOpenDialog}
            data={data}
            id={id}
            fieldName={fieldName}
          />
        </DropdownMenu.Item>
        <DropdownMenu.Item asChild>
          <NodeRemoveActionDialog onRemoveNode={onRemoveNode} />
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  );
};

const NodeRemoveActionDialog = ({
  onRemoveNode,
}: {
  onRemoveNode: () => void;
}) => {
  return (
    <AlertDialog>
      <AlertDialog.Trigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <IconTrash className="size-4 text-destructive" />
          Delete
        </Button>
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

const NodeEditForm = ({
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
  fieldName: AutomationNodesType;
}) => {
  return (
    <Dialog
      open={isOpenDialog}
      onOpenChange={(open) => {
        setOpenDialog(open);
      }}
    >
      <Dialog.Trigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-start">
          <IconEdit className="size-4" />
          Edit
        </Button>
      </Dialog.Trigger>
      <EditForm
        id={id}
        fieldName={fieldName}
        data={data}
        callback={() => setOpenDialog(false)}
      />
    </Dialog>
  );
};
