import { Button, Dialog, Label, Select, Spinner } from 'erxes-ui';
import { useState } from 'react';
import { useDocumentsTypes } from '../hooks/useDocumentsTypes';

type DocumentTypeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (contentType: string) => void | Promise<void>;
  initialContentType?: string;
  duplicate?: boolean;
  loading?: boolean;
};

export const DocumentTypeDialog = ({
  open,
  onOpenChange,
  onSelect,
  initialContentType,
  duplicate = false,
  loading = false,
}: DocumentTypeDialogProps) => {
  const {
    documentsTypes,
    error,
    loading: typesLoading,
    refetch,
  } = useDocumentsTypes();
  const [selectedType, setSelectedType] = useState(initialContentType || '');
  const validType = documentsTypes.some(
    (type) => type.contentType === selectedType,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        className="max-w-md"
        onClick={(event) => event.stopPropagation()}
      >
        <Dialog.Header>
          <Dialog.Title>
            {duplicate ? 'Duplicate document' : 'Add document'}
          </Dialog.Title>
          <Dialog.Description>
            Choose which record type this document will use.
          </Dialog.Description>
        </Dialog.Header>
        {typesLoading ? (
          <Spinner />
        ) : error ? (
          <div className="space-y-2">
            <p className="text-sm text-destructive">
              Could not load document types.
            </p>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                void refetch().catch(() => undefined);
              }}
            >
              Try again
            </Button>
          </div>
        ) : documentsTypes.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No document types are available.
          </p>
        ) : (
          <div className="grid gap-2">
            <Label htmlFor="document-type">Document type</Label>
            <Select
              value={selectedType}
              onValueChange={setSelectedType}
              disabled={loading}
            >
              <Select.Trigger id="document-type">
                <Select.Value placeholder="Select a type" />
              </Select.Trigger>
              <Select.Content>
                {documentsTypes.map((type) => (
                  <Select.Item key={type.contentType} value={type.contentType}>
                    {type.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </div>
        )}
        <Dialog.Footer>
          <Button
            type="button"
            variant="secondary"
            disabled={loading}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!validType || loading || typesLoading || !!error}
            onClick={() => {
              void onSelect(selectedType);
            }}
          >
            {loading
              ? 'Duplicating…'
              : duplicate
              ? 'Duplicate'
              : 'Create document'}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
