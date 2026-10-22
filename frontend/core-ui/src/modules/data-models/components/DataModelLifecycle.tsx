import { AlertDialog, Button } from 'erxes-ui';
import { DATA_MODEL_ARCHIVE, DATA_MODEL_RESTORE } from '../graphql';
import { useDataModelMutation } from '../hooks';
import type { DataModel } from '../types';

export const DataModelLifecycle = ({
  model,
  onClose,
}: {
  model: DataModel;
  onClose: () => void;
}) => {
  const restoring = Boolean(model.archivedAt);
  const [save, { loading, error }] = useDataModelMutation(
    restoring ? DATA_MODEL_RESTORE : DATA_MODEL_ARCHIVE,
    restoring ? 'Model restored' : 'Model archived',
  );
  const submit = async () => {
    try {
      const result = await save({
        variables: { _id: model._id, expectedVersion: model.version },
      });
      if (!result.data) return;
      onClose();
    } catch {
      /* Keep the confirmation open with the server error. */
    }
  };
  return (
    <AlertDialog open onOpenChange={(open) => !open && !loading && onClose()}>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>
            {restoring ? 'Restore' : 'Archive'} {model.labelPlural}?
          </AlertDialog.Title>
          <AlertDialog.Description>
            {restoring
              ? 'This makes the model and its records available again.'
              : 'Records and fields will be preserved. Record access is paused until you restore the model.'}
          </AlertDialog.Description>
        </AlertDialog.Header>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error.message} Close this dialog and reload the model before
            retrying a version conflict.
          </p>
        )}
        <AlertDialog.Footer>
          <Button variant="outline" disabled={loading} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant={restoring ? 'default' : 'destructive'}
            disabled={loading}
            onClick={() => {
              void submit();
            }}
          >
            {loading
              ? 'Saving…'
              : restoring
              ? 'Restore model'
              : 'Archive model'}
          </Button>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
};
