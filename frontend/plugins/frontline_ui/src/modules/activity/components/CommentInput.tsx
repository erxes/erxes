import { EditorToolbar } from '@/activity/components/EditorToolbar';
import { useCreateTicketComment } from '@/activity/hooks/useCreateTicketComment';
import { trimEmptyBlocks } from '@/activity/utils';
import { TicketHotKeyScope } from '@/ticket/types/ticketHotkeyScope';
import type { Block } from '@blocknote/core';
import { IconCommand, IconCornerDownLeft } from '@tabler/icons-react';
import {
  BlockEditor,
  Button,
  Kbd,
  useBlockEditor,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useToast,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';

/**
 * Comments are read by the requester in the client portal, so this editor
 * deliberately has no team mentions.
 */
export const CommentInput = ({ contentId }: { contentId: string }) => {
  const { t } = useTranslation('frontline');
  const { toast } = useToast();
  const editor = useBlockEditor({
    placeholder: t('write-a-comment', 'Write a comment...'),
  });
  const { createTicketComment, loading } = useCreateTicketComment(contentId);
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const onSend = () => {
    const trimmedContent = trimEmptyBlocks((editor?.document || []) as Block[]);

    if (trimmedContent.length === 0 || loading) {
      return;
    }

    createTicketComment(JSON.stringify(trimmedContent), {
      onCompleted: () => {
        editor.replaceBlocks(editor.topLevelBlocks, []);
      },
      onError: (error) => {
        toast({
          title: t('error'),
          description: error.message,
          variant: 'destructive',
        });
      },
    });
  };

  useScopedHotkeys('mod+enter', onSend, TicketHotKeyScope.CommentInput);

  return (
    <div className="flex flex-col border rounded-lg min-h-14 px-4 py-3">
      <EditorToolbar editor={editor} />
      <BlockEditor
        editor={editor}
        onFocus={() =>
          setHotkeyScopeAndMemorizePreviousScope(TicketHotKeyScope.CommentInput)
        }
        onBlur={() => goBackToPreviousHotkeyScope()}
        className="read-only"
      />
      <div className="flex justify-end">
        <Button
          size="lg"
          className="ml-auto"
          disabled={loading}
          onClick={onSend}
        >
          {t('send')}
          <Kbd className="ml-1">
            <IconCommand size={12} />
            <IconCornerDownLeft size={12} />
          </Kbd>
        </Button>
      </div>
    </div>
  );
};
