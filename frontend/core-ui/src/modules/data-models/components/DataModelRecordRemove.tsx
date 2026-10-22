import { AlertDialog, Button } from 'erxes-ui';
import { createRecordDocuments } from '../recordDocuments';
import { useDataModelMutation } from '../hooks';
import type { DataModel, DataModelRecord, ModelField } from '../types';

export const DataModelRecordRemove = ({
  record,
  model,
  fields,
  onClose,
}: {
  record: DataModelRecord;
  model: DataModel;
  fields: ModelField[];
  onClose: () => void;
}) => {
  const [remove, { loading, error }] = useDataModelMutation(
    createRecordDocuments(model, fields).remove,
    'Record moved to deleted',
  );
  const submit = async () => {
    try {
      const result = await remove({
        variables: {
          _id: record._id,
          expectedVersion: record.version,
        },
      });
      if (!result.data) return;
      onClose();
    } catch {
      /* Keep the confirmation open so errors remain actionable. */
    }
  };
  return (
    <AlertDialog open onOpenChange={(open) => !open && !loading && onClose()}>
      <AlertDialog.Content>
        <AlertDialog.Header>
          <AlertDialog.Title>Delete this record?</AlertDialog.Title>
          <AlertDialog.Description>
            This is a soft deletion. Its values are preserved and you can
            restore it from Deleted records.
          </AlertDialog.Description>
        </AlertDialog.Header>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error.message} Refresh records and reopen this confirmation if the
            version changed.
          </p>
        )}
        <AlertDialog.Footer>
          <Button variant="outline" disabled={loading} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={loading}
            onClick={() => {
              void submit();
            }}
          >
            {loading ? 'Deleting…' : 'Delete record'}
          </Button>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog>
  );
};
