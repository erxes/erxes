import { useCreateNote } from '@/task/hooks/useCreateNote';
import { TaskHotKeyScope } from '@/task/TaskHotkeyScope';
import type { Block } from '@blocknote/core';
import { GET_ACTIVITIES } from '@/activity/graphql/queries/getActivityLogs';
import { useRef, useState } from 'react';
import { IconCommand, IconCornerDownLeft } from '@tabler/icons-react';
import {
  BlockEditor,
  Button,
  getMentionedUserIds,
  Kbd,
  useBlockEditor,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useToast,
  type IBlockEditor,
} from 'erxes-ui';
import { AssignMemberInEditor } from 'ui-modules';
import { useTranslation } from 'react-i18next';

export const NoteInput = ({
  contentId,
  onSent,
}: {
  contentId: string;
  onSent?: () => void;
}) => {
  const { t } = useTranslation('operation');
  const editor = useBlockEditor({ placeholder: t('leave-a-note') });
  const { createNote, loading } = useCreateNote();
  const { toast } = useToast();
  const sending = useRef(false);
  const [hasContent, setHasContent] = useState(false);
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const onSend = async () => {
    if (sending.current) return;
    const content = editor.document;
    const isEmptyParagraph = (block: IBlockEditor['document'][number]) => {
      return (
        block.type === 'paragraph' &&
        (!block.content || block.content.length === 0) &&
        (!block.children || block.children.length === 0)
      );
    };

    let startIndex = 0;
    while (
      startIndex < content.length &&
      isEmptyParagraph(content[startIndex])
    ) {
      startIndex++;
    }

    let endIndex = content.length - 1;
    while (endIndex >= startIndex && isEmptyParagraph(content[endIndex])) {
      endIndex--;
    }
    const trimmedContent = content.slice(startIndex, endIndex + 1);
    if (trimmedContent.length === 0) {
      return;
    }
    sending.current = true;
    try {
      await createNote({
        variables: {
          content: JSON.stringify(trimmedContent),
          contentId: contentId,
          // The shared mention reader accepts BlockNote's default schema.
          mentions: getMentionedUserIds(trimmedContent as Block[]),
        },
        refetchQueries: [
          {
            query: GET_ACTIVITIES,
            variables: { contentId, direction: 'backward', limit: 30 },
          },
        ],
        onCompleted: () => {
          editor.replaceBlocks(editor.topLevelBlocks, []);
          setHasContent(false);
          onSent?.();
          toast({ title: t('note-sent', 'Note sent') });
        },
      });
    } catch (error) {
      toast({
        title: t('error'),
        description:
          error instanceof Error
            ? error.message
            : t('failed-to-send-note', 'Failed to send note'),
        variant: 'destructive',
      });
    } finally {
      sending.current = false;
    }
  };
  useScopedHotkeys('mod+enter', onSend, TaskHotKeyScope.NoteInput);
  return (
    <div className="flex min-w-0 flex-col gap-2 rounded-lg border bg-background px-3 py-2">
      <BlockEditor
        editor={editor}
        disabled={loading}
        onChange={() =>
          setHasContent(
            editor.document.some(
              (block) =>
                block.type !== 'paragraph' ||
                (Array.isArray(block.content) && block.content.length > 0) ||
                block.children.length > 0,
            ),
          )
        }
        onFocus={() =>
          setHotkeyScopeAndMemorizePreviousScope(TaskHotKeyScope.NoteInput)
        }
        onBlur={() => goBackToPreviousHotkeyScope()}
        className="max-h-[30svh] min-h-10 overflow-y-auto read-only [&_.bn-editor]:px-1"
        slashMenuOnTop
      >
        <AssignMemberInEditor editor={editor} />
      </BlockEditor>
      <div className="flex justify-end">
        <Button
          size="sm"
          className="ml-auto"
          disabled={loading || !hasContent}
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
