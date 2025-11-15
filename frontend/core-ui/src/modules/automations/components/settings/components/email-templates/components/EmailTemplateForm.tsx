import { useAutomationEmailTemplateDetail } from '@/automations/components/settings/components/email-templates/hooks/useAutomationEmailTemplateDetail';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import { BlockEditor, Button, Input, Label, useBlockEditor } from 'erxes-ui';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router';
import { z } from 'zod';

import {
  useCreateAutomationEmailTemplate,
  useUpdateAutomationEmailTemplate,
} from '@/automations/components/settings/components/email-templates/hooks/useAutomationEmailTemplateMutations';

const emailTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
});

type EmailTemplateFormData = z.infer<typeof emailTemplateSchema>;

interface EmailTemplateFormProps {
  templateId?: string;
}

export function EmailTemplateForm({ templateId }: EmailTemplateFormProps) {
  const navigate = useNavigate();
  const isEditing = !!templateId;

  const { emailTemplate, loading: loadingTemplate } =
    useAutomationEmailTemplateDetail(templateId || '');

  const { createEmailTemplate, loading: creating } =
    useCreateAutomationEmailTemplate();
  const { updateEmailTemplate, loading: updating } =
    useUpdateAutomationEmailTemplate();

  const editor = useBlockEditor({});

  const form = useForm<EmailTemplateFormData>({
    resolver: zodResolver(emailTemplateSchema),
    defaultValues: {
      name: '',
      description: '',
      content: '',
    },
  });

  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors },
  } = form;

  // Load template data when editing
  useEffect(() => {
    if (emailTemplate && isEditing) {
      setValue('name', emailTemplate.name);
      setValue('description', emailTemplate.description || '');
      setValue('content', emailTemplate.content);

      // Load content into editor
      if (emailTemplate.content) {
        try {
          const blocks = JSON.parse(emailTemplate.content);
          editor.replaceBlocks(editor.document, blocks);
        } catch {
          // If not JSON, treat as plain text
          editor.replaceBlocks(editor.document, [
            {
              id: crypto.randomUUID(),
              type: 'paragraph',
              props: {
                textColor: 'default',
                backgroundColor: 'default',
                textAlignment: 'left',
              },
              content: [
                {
                  type: 'text',
                  text: emailTemplate.content,
                  styles: {},
                },
              ],
              children: [],
            },
          ]);
        }
      }
    }
  }, [emailTemplate, isEditing, setValue, editor]);

  // Handle editor content changes
  useEffect(() => {
    const unsubscribe = editor.onChange((editor) => {
      setValue('content', JSON.stringify(editor.document));
    });

    return unsubscribe;
  }, [editor, setValue]);

  const onSubmit = async (data: EmailTemplateFormData) => {
    try {
      if (isEditing && templateId) {
        await updateEmailTemplate({
          _id: templateId,
          ...data,
        });
      } else {
        await createEmailTemplate(data);
      }
      navigate('/settings/automations/email-templates');
    } catch (error) {
      console.error('Error saving email template:', error);
    }
  };

  const isLoading = creating || updating || loadingTemplate;

  if (loadingTemplate && isEditing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading template...</div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center gap-4 p-6 border-b">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/settings/automations/email-templates">
            <IconArrowLeft className="size-4 mr-2" />
            Back to Templates
          </Link>
        </Button>
        <div>
          <h1 className="text-lg font-semibold">
            {isEditing ? 'Edit Email Template' : 'Create Email Template'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEditing
              ? 'Update your email template'
              : 'Create a new email template for automation'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
        <div className="flex-1 p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Enter template name"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                {...register('description')}
                placeholder="Enter template description"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Content *</Label>
            <div className="border rounded-lg overflow-hidden">
              <BlockEditor editor={editor} className="min-h-[400px] p-4" />
            </div>
            {errors.content && (
              <p className="text-sm text-destructive">
                {errors.content.message}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t bg-background">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/settings/automations/email-templates')}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            <IconDeviceFloppy className="size-4 mr-2" />
            {isLoading
              ? 'Saving...'
              : isEditing
              ? 'Update Template'
              : 'Create Template'}
          </Button>
        </div>
      </form>
    </div>
  );
}
