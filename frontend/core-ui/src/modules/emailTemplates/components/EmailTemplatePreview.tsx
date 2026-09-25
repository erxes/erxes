import { EmailContentEditor } from '@/emailTemplates/components/EmailContentEditor';
import { emailTemplateFormat, IEmailTemplate } from '@/emailTemplates/types';
import { BlockEditor, useBlockEditor } from 'erxes-ui';
import { useEffect } from 'react';

const BlocksPreview = ({ content }: { content: string }) => {
  const editor = useBlockEditor();

  useEffect(() => {
    try {
      editor.replaceBlocks(editor.document, JSON.parse(content || '[]'));
    } catch {
      // Content that is not a block document has nothing to preview.
    }
  }, [content, editor]);

  return <BlockEditor editor={editor} readonly className="px-4 py-8" />;
};

/** The template as it will look, shrunk to fit a card. */
export const EmailTemplatePreview = ({
  template,
}: {
  template: IEmailTemplate;
}) => (
  <div className="relative h-full w-full overflow-hidden">
    <div className="pointer-events-none h-auto w-[333%] origin-top-left scale-[0.3] select-none">
      {emailTemplateFormat(template) === 'maily' ? (
        <EmailContentEditor
          contentJson={template.contentJson}
          onChange={() => undefined}
          editable={false}
        />
      ) : (
        <BlocksPreview content={template.content || ''} />
      )}
    </div>
  </div>
);
