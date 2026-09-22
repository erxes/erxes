import { EmailSenderScopeProvider } from '@/settings/mail-config/contexts/EmailSenderScope';
import type { Editor as TiptapEditor } from '@tiptap/core';
import { cn, Form } from 'erxes-ui';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { BroadcastCopyHtmlButton } from '../BroadcastCopyHtmlButton';
import { EmailContentEditor } from '@/emailTemplates/components/EmailContentEditor';
import { BroadcastInsertTemplate } from '../BroadcastInsertTemplate';
import { BroadcastPreviewEmailDialog } from '../BroadcastPreviewEmailDialog';
import { BroadcastSaveAsTemplate } from '../BroadcastSaveAsTemplate';
import { BroadcastSendTestEmail } from '../BroadcastSendTestEmail';

/**
 * The email itself, with the tools that act on it in a bar above rather than
 * among the fields in the other panel.
 */
export const BroadcastEmailPreview = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const [editor, setEditor] = useState<TiptapEditor>();

  const hasError = !!(errors?.email as { contentJson?: unknown })?.contentJson;

  return (
    // The test send reads the broadcast sender list, which is not the default
    // scope this far from the form.
    <EmailSenderScopeProvider scope="broadcast">
      <div className="flex h-full flex-col">
        <div className="flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4">
          {editor && <BroadcastInsertTemplate editor={editor} />}
          <div className="ml-auto flex items-center gap-2">
            <BroadcastPreviewEmailDialog />
            <BroadcastCopyHtmlButton />
            <BroadcastSendTestEmail />
            <BroadcastSaveAsTemplate />
          </div>
        </div>

        <Form.Field
          name="email.contentJson"
          control={control}
          rules={{ required: 'Content is required' }}
          render={({ field }) => (
            <Form.Item className="flex min-h-0 flex-1 flex-col">
              <Form.Control>
                <div
                  className={cn(
                    'min-h-0 flex-1 overflow-y-auto bg-white',
                    hasError && 'ring-1 ring-inset ring-destructive',
                  )}
                >
                  <EmailContentEditor
                    contentJson={field.value}
                    onChange={field.onChange}
                    onCreate={setEditor}
                  />
                </div>
              </Form.Control>
            </Form.Item>
          )}
        />
      </div>
    </EmailSenderScopeProvider>
  );
};
