import { BlockEditor, useBlockEditor } from 'erxes-ui';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MembersInline } from 'ui-modules';

export const BroadcastTabPreviewEmailContent = ({
  message,
}: {
  message: any;
}) => {
  const { t } = useTranslation('broadcasts', { keyPrefix: 'email-tab' });
  const { fromUserId, email } = message || {};
  const { sender, subject, content } = email || {};
  const editor = useBlockEditor();

  useEffect(() => {
    const loadInitialContent = async () => {
      let blocks;

      try {
        blocks = JSON.parse(content);
      } catch (_error) {
        blocks = await editor.tryParseHTMLToBlocks(content);
      }

      editor.replaceBlocks(editor.document, blocks);
    };

    loadInitialContent();
  }, [content, editor]);

  return (
    <div className="flex flex-col gap-8 h-full w-full">
      <div className="px-9 py-5 border rounded-md bg-muted space-y-2">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t('subject', 'Subject:')}</span>{' '}
          <h3 className="line-clamp-1">{subject} </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{t('from', 'From:')}</span>
          <MembersInline memberIds={[fromUserId]} className="font-semibold" />
          {sender && (
            <>
              <span className="text-sm text-muted-foreground">{t('as', 'as')}</span>
              <span className="font-semibold">{sender}</span>
            </>
          )}
        </div>
      </div>

      <BlockEditor
        editor={editor}
        readonly
        className="select-none flex-1 w-full overflow-y-auto"
      />
    </div>
  );
};
