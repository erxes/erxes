import { useEmailDocumentPlaceholder } from '@/automations/components/common/EmailDocumentPlaceholderPicker';
import { EmailContentEditor } from '@/emailTemplates/components/EmailContentEditor';
import { EmailContentPreview } from '@/emailTemplates/components/EmailContentPreview';
import { useEmailTemplateDetail } from '@/emailTemplates/hooks/useEmailTemplateDetail';
import { useEmailTemplateMutations } from '@/emailTemplates/hooks/useEmailTemplateMutations';
import { emailTemplateFormat } from '@/emailTemplates/types';
import { EmailTemplatePath } from '@/types/paths/EmailTemplatePath';
import {
  IconArrowLeft,
  IconChevronRight,
  IconDeviceFloppy,
  IconEye,
  IconEyeOff,
} from '@tabler/icons-react';
import {
  BlockEditor,
  Button,
  cn,
  Input,
  JSONContent,
  Popover,
  readImage,
  REACT_APP_API_URL,
  Spinner,
  useBlockEditor,
} from 'erxes-ui';
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { PageHeader, PageHeaderEnd, PageHeaderStart } from 'ui-modules';

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
 * The template is the email, so the email is the page: its name sits in the
 * header a title belongs in, and everything else is the canvas.
 *
 * A template is written in whichever editor made it: new ones in the email
 * editor, older ones in the block editor they were built with. Nothing is
 * converted, so nothing is lost.
 */
export const EmailTemplateForm = ({ templateId }: { templateId?: string }) => {
  const navigate = useNavigate();
  const isEditing = !!templateId;

  const { emailTemplate, loading: loadingTemplate } =
    useEmailTemplateDetail(templateId);
  const {
    addEmailTemplate,
    editEmailTemplate,
    loading: saving,
  } = useEmailTemplateMutations();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState<string>();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [content, setContent] = useState('');
  const [contentJson, setContentJson] = useState<JSONContent>();

  const format = isEditing ? emailTemplateFormat(emailTemplate) : 'maily';

  const editor = useBlockEditor({ uploadFile: uploadEmailTemplateImage });
  const { additionalSlashMenuItems, documentPlaceholderPicker } =
    useEmailDocumentPlaceholder({ editor });

  useEffect(() => {
    if (!emailTemplate) {
      return;
    }

    setName(emailTemplate.name);
    setDescription(emailTemplate.description || '');
    setContent(emailTemplate.content || '');
    setContentJson(emailTemplate.contentJson);

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

  const handleSave = async () => {
    if (!name.trim()) {
      setNameError('Name is required');
      return;
    }

    setNameError(undefined);

    const variables = {
      name,
      description,
      contentFormat: format,
      ...(format === 'maily' ? { contentJson } : { content }),
    };

    if (isEditing) {
      await editEmailTemplate({ variables: { _id: templateId, ...variables } });
    } else {
      await addEmailTemplate({ variables });
    }

    navigate(EmailTemplatePath.Index);
  };

  if (loadingTemplate && isEditing) {
    return (
      <div className="flex h-full items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <>
      {/* The same header an automation template is edited under: where it came
          from, what it is called, and what can be done with it. */}
      <PageHeader>
        <PageHeaderStart className="gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link to={EmailTemplatePath.Index}>
              <IconArrowLeft className="size-4" />
              Back
            </Link>
          </Button>

          <div className="flex min-w-0 items-center gap-1 text-sm">
            <span className="text-muted-foreground">Email templates</span>
            <IconChevronRight className="size-3.5 shrink-0 text-muted-foreground" />
            <Popover>
              <Popover.Trigger asChild>
                <button
                  type="button"
                  className={cn(
                    '-mx-1 max-w-[16rem] truncate rounded px-1 text-left font-medium hover:bg-accent',
                    nameError && 'text-destructive',
                  )}
                >
                  {name || 'Untitled template'}
                </button>
              </Popover.Trigger>
              <Popover.Content align="start" className="w-80 space-y-2 p-3">
                <Input
                  value={name}
                  placeholder="Template name"
                  onChange={(event) => setName(event.currentTarget.value)}
                />
                <Input
                  value={description}
                  placeholder="Description"
                  onChange={(event) =>
                    setDescription(event.currentTarget.value)
                  }
                />
              </Popover.Content>
            </Popover>
          </div>
        </PageHeaderStart>

        <PageHeaderEnd className="gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsPreviewOpen((open) => !open)}
          >
            {isPreviewOpen ? (
              <IconEyeOff className="size-4" />
            ) : (
              <IconEye className="size-4" />
            )}
            {isPreviewOpen ? 'Hide preview' : 'Preview'}
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <Link to={EmailTemplatePath.Index}>Cancel</Link>
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <IconDeviceFloppy className="size-4" />
            {saving ? 'Saving...' : 'Save template'}
          </Button>
        </PageHeaderEnd>
      </PageHeader>

      <div className="flex min-h-0 flex-1">
        <main className="min-h-0 flex-1 overflow-y-auto bg-muted/40 p-6">
          <div className="mx-auto min-h-full w-full max-w-[720px] rounded-lg border bg-white shadow-sm">
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
        </main>

        {/* The rendered email beside the written one, so what the recipient
            gets is never a guess. */}
        {isPreviewOpen && (
          <aside className="flex w-[45%] min-w-0 shrink-0 flex-col border-l bg-background">
            <div className="flex h-10 shrink-0 items-center border-b px-4 font-mono text-xs uppercase text-accent-foreground">
              Preview
            </div>
            <div className="min-h-0 flex-1">
              <EmailContentPreview
                content={content}
                contentJson={contentJson}
                contentFormat={format}
              />
            </div>
          </aside>
        )}
      </div>

      {format === 'blocks' && documentPlaceholderPicker}
    </>
  );
};
