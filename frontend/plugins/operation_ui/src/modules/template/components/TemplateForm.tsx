import {
  Button,
  Form,
  Input,
  useToast,
  BlockEditor,
  useBlockEditor,
  Separator,
  Label,
} from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import {
  templateAddMutation,
  templateEditMutation,
} from '../graphql/mutations';
import { useState } from 'react';
import { Block } from '@blocknote/core';

export const TemplateForm = ({
  teamId,
  template,
  onCancel,
  afterSave,
}: {
  teamId?: string;
  template?: any;
  onCancel?: () => void;
  afterSave?: () => void;
}) => {
  const { toast } = useToast();
  
  const [descriptionContent, setDescriptionContent] = useState<Block[] | undefined>(
    template?.defaults?.description
      ? JSON.parse(template.defaults.description)
      : undefined
  );

  const editor = useBlockEditor({
    initialContent: descriptionContent,
  });

  const form = useForm({
    defaultValues: {
      teamId: teamId || '',
      name: template?.name || '',
      taskName: template?.defaults?.name || '',
    },
  });

  const [addMutation] = useMutation(templateAddMutation, {
    refetchQueries: ['operationTemplates'],
  });
  const [editMutation] = useMutation(templateEditMutation, {
    refetchQueries: ['operationTemplates'],
  });

  const handleDescriptionChange = async () => {
    const content = await editor?.document;
    if (content) {
      setDescriptionContent(content as Block[]);
    }
  };

  const onSubmit = (values: any) => {
    const { name, taskName } = values;

    const defaults = {
      name: taskName,
      description: JSON.stringify(descriptionContent),
    };

    const variables = {
      name,
      teamId,
      defaults,
    };

    if (template) {
      editMutation({ variables: { _id: template._id, ...variables } })
        .then(() => {
          toast({ title: 'Template updated' });
          afterSave?.();
        })
        .catch((e) => {
          toast({ title: 'Error', description: e.message, variant: 'destructive' });
        });
    } else {
      addMutation({ variables })
        .then(() => {
          toast({ title: 'Template created' });
          afterSave?.();
        })
        .catch((e) => {
          toast({ title: 'Error', description: e.message, variant: 'destructive' });
        });
    }
  };

  return (
    <div className="p-6 flex flex-col h-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 flex flex-col h-full">
          <div className="space-y-4 shrink-0">
             <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Template Name</Form.Label>
                  <Form.Control>
                    <Input {...field} placeholder="e.g., Bug Report, Feature Request" />
                  </Form.Control>
                </Form.Item>
              )}
            />
          </div>

          <Separator />

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <h3 className="font-semibold text-sm text-foreground/80">Task Content</h3>
              <Form.Field
                control={form.control}
                name="taskName"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>Task Title</Form.Label>
                    <Form.Control>
                      <Input {...field} placeholder="Default task title" />
                    </Form.Control>
                  </Form.Item>
                )}
              />

              <div className="space-y-2">
                 <Label>Task Description</Label>
                 <div className="border rounded-md min-h-[150px] p-2">
                    <BlockEditor
                      editor={editor}
                      onChange={handleDescriptionChange}
                      className="min-h-full"
                    />
                 </div>
              </div>
          </div>

          <div className="flex justify-end gap-2 shrink-0 pt-2 mt-auto">
            <Button variant="outline" onClick={onCancel} type="button">
              Cancel
            </Button>
            <Button type="submit">Save Template</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
