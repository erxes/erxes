import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Combobox,
  Command,
  Dialog,
  Form,
  Popover,
  Spinner,
} from 'erxes-ui';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useDocumentsTypes } from '../hooks/useDocumentsTypes';

const documentTypeSchema = z.object({
  contentType: z.string().min(1, 'Select a document type'),
});

/** Ask for an available document type before creating or duplicating a template. */
export function DocumentTypeDialog({
  open,
  onOpenChange,
  onSelect,
  initialType = '',
  duplicating = false,
  loading = false,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (contentType: string) => Promise<boolean> | boolean;
  initialType?: string;
  duplicating?: boolean;
  loading?: boolean;
}>) {
  const [typeOpen, setTypeOpen] = useState(false);
  const {
    documentsTypes,
    loading: typesLoading,
    error,
    refetch,
  } = useDocumentsTypes();
  const form = useForm<z.infer<typeof documentTypeSchema>>({
    resolver: zodResolver(documentTypeSchema),
    defaultValues: { contentType: initialType },
  });
  const pending = loading || form.formState.isSubmitting;
  const submit = form.handleSubmit(async ({ contentType }) => {
    if (!documentsTypes.some((type) => type.contentType === contentType)) {
      form.setError('contentType', {
        message: 'Select an available document type',
      });
      return;
    }
    if (await onSelect(contentType)) onOpenChange(false);
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!pending) onOpenChange(nextOpen);
      }}
    >
      <Dialog.Content
        className="max-w-md"
        onClick={(event) => event.stopPropagation()}
      >
        <Dialog.Header>
          <Dialog.Title>
            {duplicating ? 'Duplicate document' : 'Add document'}
          </Dialog.Title>
          <Dialog.Description>
            Select the type for this document.
          </Dialog.Description>
        </Dialog.Header>
        <Form {...form}>
          <Form.Field
            control={form.control}
            name="contentType"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>Document type</Form.Label>
                <Popover open={typeOpen} onOpenChange={setTypeOpen}>
                  <Form.Control>
                    <Combobox.Trigger
                      ref={field.ref}
                      onBlur={field.onBlur}
                      disabled={pending || typesLoading || Boolean(error)}
                    >
                      <Combobox.Value
                        value={
                          documentsTypes.find(
                            (type) => type.contentType === field.value,
                          )?.label
                        }
                        placeholder="Select a document type"
                      />
                    </Combobox.Trigger>
                  </Form.Control>
                  <Combobox.Content
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Command label="Search document types">
                      <Command.Input placeholder="Search document types..." />
                      <Command.List>
                        <Command.Empty>No document types found.</Command.Empty>
                        {documentsTypes.map((type) => (
                          <Command.Item
                            key={type.contentType}
                            value={type.contentType}
                            keywords={[type.label]}
                            disabled={pending || typesLoading || Boolean(error)}
                            onSelect={() => {
                              field.onChange(type.contentType);
                              setTypeOpen(false);
                            }}
                          >
                            {type.label}
                            <Combobox.Check
                              checked={field.value === type.contentType}
                            />
                          </Command.Item>
                        ))}
                      </Command.List>
                    </Command>
                  </Combobox.Content>
                </Popover>
                <Form.Message />
              </Form.Item>
            )}
          />
        </Form>
        {typesLoading && <Spinner />}
        {error && (
          <div role="alert" className="text-sm text-destructive">
            Could not load document types.{' '}
            <Button
              type="button"
              variant="link"
              onClick={() => {
                refetch().catch(() => undefined);
              }}
            >
              Retry
            </Button>
          </div>
        )}
        {!typesLoading && !error && !documentsTypes.length && (
          <p className="text-sm text-muted-foreground">
            No document types are available.
          </p>
        )}
        <Dialog.Footer>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={
              pending ||
              typesLoading ||
              Boolean(error) ||
              !documentsTypes.length
            }
            onClick={() => {
              submit();
            }}
          >
            {pending && <Spinner />}
            {duplicating ? 'Duplicate' : 'Continue'}
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
}
