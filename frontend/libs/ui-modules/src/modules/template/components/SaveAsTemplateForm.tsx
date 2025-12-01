import { useState, useEffect } from 'react';
import {
  Sheet,
  Input,
  Label,
  Select,
  Textarea,
  Button,
  Spinner,
} from 'erxes-ui';
import { gql, useMutation } from '@apollo/client';

const TEMPLATE_SAVE_FROM = gql`
  mutation TemplateSaveFrom(
    $sourceId: String!
    $contentType: String!
    $name: String!
    $description: String
    $status: String
  ) {
    templateSaveFrom(
      sourceId: $sourceId
      contentType: $contentType
      name: $name
      description: $description
      status: $status
    )
  }
`;

export interface UseSaveAsTemplateOptions {
  contentType: string;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export const useSaveAsTemplate = ({
  contentType,
  onSuccess,
  onError,
}: UseSaveAsTemplateOptions) => {
  const [saveAsTemplate, { loading, error }] = useMutation(TEMPLATE_SAVE_FROM, {
    onCompleted: (data) => {
      onSuccess?.(data.templateSaveFrom);
    },
    onError: (error) => {
      onError?.(error);
    },
  });

  const handleSave = (
    input: { name: string; description?: string; status?: string },
    sourceId: string,
  ) => {
    return saveAsTemplate({
      variables: {
        sourceId,
        contentType,
        ...input,
      },
    });
  };

  return {
    saveAsTemplate: handleSave,
    loading,
    error,
  };
};

export const SaveAsTemplateForm = ({
  trigger,
  contentType,
  contentId,
  title = 'Save as Template',
  onSuccess,
  onError,
}: {
  trigger: React.ReactNode;
  contentType: string;
  contentId: string;
  title?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('active');

  const { saveAsTemplate, loading } = useSaveAsTemplate({
    contentType,
    onSuccess: (data) => {
      setOpen(false);
      onSuccess?.(data);
    },
    onError,
  });

  const entityName = contentType.split(':')[1] || 'item';

  useEffect(() => {
    if (!open) {
      setName('');
      setDescription('');
      setStatus('active');
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    saveAsTemplate(
      {
        name: name.trim(),
        description: description.trim() || undefined,
        status,
      },
      contentId,
    );
  };

  const handleCancel = () => {
    setName('');
    setDescription('');
    setStatus('active');
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <Sheet.Trigger>{trigger}</Sheet.Trigger>
      <Sheet.View
        className="p-0"
        onEscapeKeyDown={(e) => {
          e.preventDefault();
        }}
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-0 w-full h-full"
        >
          <Sheet.Header>
            <Sheet.Title className="text-lg text-foreground">
              {title}
            </Sheet.Title>
            <Sheet.Close />
          </Sheet.Header>
          <Sheet.Content className="grow size-full h-auto flex flex-col px-5 py-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="template-name">
                Template Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="template-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={`Enter template name for ${entityName}`}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter template description (optional)"
                rows={3}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="template-status">Status</Label>
              <Select
                value={status}
                onValueChange={setStatus}
                disabled={loading}
              >
                <Select.Trigger id="template-status">
                  <Select.Value placeholder="Select status" />
                </Select.Trigger>
                <Select.Content>
                  <Select.Item value="active">Active</Select.Item>
                  <Select.Item value="inactive">Inactive</Select.Item>
                </Select.Content>
              </Select>
            </div>
          </Sheet.Content>
          <Sheet.Footer>
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim()}>
              {loading ? <Spinner /> : 'Save as Template'}
            </Button>
          </Sheet.Footer>
        </form>
      </Sheet.View>
    </Sheet>
  );
};
