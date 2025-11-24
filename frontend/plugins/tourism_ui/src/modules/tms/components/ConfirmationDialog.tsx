import { IconCopy, IconTrash } from '@tabler/icons-react';
import { Dialog, Button } from 'erxes-ui';

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'duplicate' | 'delete';
  branchName: string;
  loading: boolean;
  onConfirm: () => void;
}

export const ConfirmationDialog = ({
  open,
  onOpenChange,
  type,
  branchName,
  loading,
  onConfirm,
}: ConfirmationDialogProps) => {
  const isDuplicate = type === 'duplicate';
  const isDelete = type === 'delete';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content className="sm:max-w-md">
        <Dialog.Header>
          <div className="flex gap-3 items-center">
            <div
              className={`p-2 rounded-full ${
                isDuplicate ? 'bg-muted' : 'bg-destructive/10'
              }`}
            >
              {isDuplicate ? (
                <IconCopy size={20} />
              ) : (
                <IconTrash size={20} className="text-destructive" />
              )}
            </div>
            <Dialog.Title className="text-lg font-bold">
              {isDuplicate ? 'Duplicate Branch' : 'Delete Branch'}
            </Dialog.Title>
          </div>
        </Dialog.Header>
        <div className="space-y-4">
          <div className="p-3 rounded-lg border shadow-sm bg-background">
            <p className="text-sm font-medium text-foreground">
              {isDuplicate
                ? 'This will create a new branch with copied settings'
                : 'Warning: This action cannot be undone'}
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to{' '}
            {isDuplicate ? 'create a duplicate of' : 'permanently delete'}{' '}
            <strong className="text-foreground">"{branchName}"</strong>?{' '}
            {isDuplicate
              ? 'A new branch will be created with all the same configurations.'
              : 'All associated data will be lost forever.'}
          </p>
        </div>
        <Dialog.Footer>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant={isDelete ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading
              ? isDuplicate
                ? 'Duplicating...'
                : 'Deleting...'
              : isDuplicate
              ? 'Yes, Duplicate'
              : 'Yes, Delete Forever'}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
