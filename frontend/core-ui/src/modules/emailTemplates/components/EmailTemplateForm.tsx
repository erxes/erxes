import { useEmailDocumentPlaceholder } from '@/automations/components/common/EmailDocumentPlaceholderPicker';
import { EmailContentEditor } from '@/emailTemplates/components/EmailContentEditor';
import { EmailContentPreview } from '@/emailTemplates/components/EmailContentPreview';
import { EmailTemplatesBreadcrumb } from '@/emailTemplates/components/EmailTemplatesBreadcrumb';
import { useEmailTemplateDetail } from '@/emailTemplates/hooks/useEmailTemplateDetail';
import { useEmailTemplateMutations } from '@/emailTemplates/hooks/useEmailTemplateMutations';
import { emailTemplateFormat } from '@/emailTemplates/types';
import { EmailTemplatePath } from '@/types/paths/EmailTemplatePath';
import { zodResolver } from '@hookform/resolvers/zod';
import { IconDeviceFloppy, IconEye, IconEyeOff } from '@tabler/icons-react';
import {
  BlockEditor,
  Button,
  cn,
  EmailPreviewDevice,
  EmailPreviewDeviceToggle,
  Form,
  Input,
  JSONContent,
  PageSubHeader,
  Popover,
  readImage,
  REACT_APP_API_URL,
  renderEmailHtml,
  Spinner,
  Textarea,
  useBlockEditor,
  useToast,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { PageHeader, PageHeaderEnd, PageHeaderStart } from 'ui-modules';
import { z } from 'zod';

const emailTemplateFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

type TEmailTemplateForm = z.infer<typeof emailTemplateFormSchema>;

const uploadEmailTemplateImage = async (file: File) => {
  if (!file.type.startsWith('image/')) {
    throw new Error('Only image files can be uploaded');
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${REACT_APP_API_URL}/upload-file?kind=main`, {
    method: 'post',
    body: formData,
    credentials: 'include',
  });

  const fileKey = await response.text();

  if (!response.ok || !fileKey) {
    throw new Error(fileKey || 'Failed to upload image');
  }

  return readImage(fileKey);
};

/**
 * A template is written in whichever editor made it: new ones in the email
 * editor, older ones in the block editor they were built with. Nothing is
 * converted, so nothing is lost.
 */
export const EmailTemplateForm = ({ templateId }: { templateId?: string }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEditing = !!templateId;

  const { emailTemplate, loading: loadingTemplate } =
    useEmailTemplateDetail(templateId);
  const {
    addEmailTemplate,
    editEmailTemplate,
    loading: saving,
  } = useEmailTemplateMutations();

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isNameOpen, setIsNameOpen] = useState(false);
  const [previewDevice, setPreviewDevice] =
    useState<EmailPreviewDevice>('desktop');
  const [content, setContent] = useState('');
  const [contentJson, setContentJson] = useState<JSONContent>();
  // The editor keeps the content it was created with, so it is not created
  // until the saved content is in hand — otherwise opening a template and
  // saving it wrote an empty body back over it.
  const [isContentReady, setIsContentReady] = useState(!templateId);

  const form = useForm<TEmailTemplateForm>({
    resolver: zodResolver(emailTemplateFormSchema),
    values: {
      name: emailTemplate?.name || '',
      description: emailTemplate?.description || '',
    },
  });

  const format = isEditing ? emailTemplateFormat(emailTemplate) : 'maily';

  const editor = useBlockEditor({ uploadFile: uploadEmailTemplateImage });
  const { additionalSlashMenuItems, documentPlaceholderPicker } =
    useEmailDocumentPlaceholder({ editor });

  useEffect(() => {
    if (!emailTemplate) {
      return;
    }

    setContent(emailTemplate.content || '');
    setContentJson(emailTemplate.contentJson);
    setIsContentReady(true);

    if (emailTemplateFormat(emailTemplate) !== 'blocks') {
      return;
    }

    try {
      editor.replaceBlocks(
        editor.document,
        JSON.parse(emailTemplate.content || '[]'),
      );
    } catch {
      // Content that is not a block document is shown as the text it is.
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
            { type: 'text', text: emailTemplate.content || '', styles: {} },
          ],
          children: [],
        },
      ]);
    }
  }, [emailTemplate, editor]);

  useEffect(
    () =>
      editor.onChange((current) =>
        setContent(JSON.stringify(current.document)),
      ),
    [editor],
  );

  const handleSave = form.handleSubmit(
    async ({ name, description }) => {
      const variables = {
        name,
        description,
        contentFormat: format,
        // The editor's source is kept for editing; the html beside it is what
        // gets sent, with its fields left for the server to fill.
        ...(format === 'maily'
          ? { contentJson, content: await renderEmailHtml(contentJson) }
          : { content }),
      };

      if (isEditing) {
        await editEmailTemplate({
          variables: { _id: templateId, ...variables },
        });
      } else {
        await addEmailTemplate({ variables });
      }

      toast({
        variant: 'success',
        title: isEditing ? 'Email template saved' : 'Email template created',
      });

      navigate(EmailTemplatePath.Index);
    },
    // The name lives behind the header, so a missing one has to bring its own
    // field back into view.
    () => setIsNameOpen(true),
  );

  if (isEditing && (loadingTemplate || !isContentReady)) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <Form {...form}>
      {/* Where it came from, and the one thing that changes it. */}
      <PageHeader>
        <PageHeaderStart>
          <EmailTemplatesBreadcrumb />
        </PageHeaderStart>
        <PageHeaderEnd>
          <Button onClick={handleSave} disabled={saving}>
            <IconDeviceFloppy className="size-4" />
            {saving ? 'Saving...' : 'Save template'}
          </Button>
        </PageHeaderEnd>
      </PageHeader>

      {/* What the template is, and what can be done while writing it. */}
      <PageSubHeader className="items-center">
        <Popover open={isNameOpen} onOpenChange={setIsNameOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              className={cn(
                'flex min-w-0 items-baseline gap-2 rounded px-2 py-1 text-left hover:bg-accent',
                form.formState.errors.name && 'text-destructive',
              )}
            >
              <span className="truncate font-medium">
                {form.watch('name') || 'Untitled template'}
              </span>
              <span className="truncate text-sm text-muted-foreground">
                {form.watch('description') || 'Add a description'}
              </span>
            </button>
          </Popover.Trigger>
          <Popover.Content align="start" className="w-80 space-y-3 p-3">
            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Name</Form.Label>
                  <Form.Control>
                    <Input placeholder="Template name" {...field} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="description"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>Description</Form.Label>
                  <Form.Control>
                    <Textarea
                      placeholder="What this template is for"
                      {...field}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </Popover.Content>
        </Popover>

        <div className="ml-auto">
          <Button
            variant="ghost"
            onClick={() => setIsPreviewOpen((open) => !open)}
          >
            {isPreviewOpen ? <IconEyeOff /> : <IconEye />}
            {isPreviewOpen ? 'Hide preview' : 'Preview'}
          </Button>
        </div>
      </PageSubHeader>

      <div className="flex min-h-0 flex-1">
        <main className="min-h-0 flex-1 overflow-y-auto bg-muted/40 p-6">
          <div className="mx-auto flex min-h-full w-full max-w-[720px] flex-col">
            <div className="flex-1 rounded-lg border bg-white shadow-sm">
              {format === 'maily' ? (
                <EmailContentEditor
                  contentJson={contentJson}
                  onChange={setContentJson}
                />
              ) : (
                <div className="p-4">
                  <BlockEditor
                    editor={editor}
                    className="min-h-[400px]"
                    additionalSlashMenuItems={additionalSlashMenuItems}
                  />
                </div>
              )}
            </div>
          </div>
        </main>

        {/* The rendered email beside the written one, so what the recipient
            gets is never a guess. */}
        {isPreviewOpen && (
          <aside className="flex w-[45%] min-w-0 shrink-0 flex-col border-l bg-background">
            <div className="flex h-10 shrink-0 items-center justify-between border-b pl-4 pr-2 font-mono text-xs uppercase text-accent-foreground">
              Preview
              <EmailPreviewDeviceToggle
                value={previewDevice}
                onChange={setPreviewDevice}
              />
            </div>
            <div className="min-h-0 flex-1">
              <EmailContentPreview
                content={content}
                contentJson={contentJson}
                contentFormat={format}
                device={previewDevice}
              />
            </div>
          </aside>
        )}
      </div>

      {format === 'blocks' && documentPlaceholderPicker}
    </Form>
  );
};
