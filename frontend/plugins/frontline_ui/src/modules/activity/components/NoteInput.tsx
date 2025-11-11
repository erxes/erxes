import {
  BlockEditor,
  getMentionedUserIds,
  Kbd,
  useBlockEditor,
  Button,
  useScopedHotkeys,
} from 'erxes-ui';
import { useCreateTicketNote } from '@/activity/hooks/useCreateTicketNote';

import { usePreviousHotkeyScope } from 'erxes-ui';
import { TicketHotKeyScope } from '@/ticket/types/TicketHotkeyScope';
import { AssignMemberInEditor } from 'ui-modules';
import { IconCommand, IconCornerDownLeft } from '@tabler/icons-react';
import type { Block } from '@blocknote/core';

export const NoteInput = ({ contentId }: { contentId: string }) => {
  const editor = useBlockEditor({ placeholder: 'Leave a note...' });
  const { createTicketNote, loading } = useCreateTicketNote();
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const onSend = async () => {
    const content = (editor?.document || []) as Block[];
    const isEmptyParagraph = (block: Block) => {
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
    createTicketNote({
      variables: {
        content: JSON.stringify(trimmedContent),
        contentId: contentId,
        mentions: getMentionedUserIds(trimmedContent),
      },
      onCompleted: () => {
        editor.replaceBlocks(editor.topLevelBlocks, []);
      },
    });
  };
  useScopedHotkeys('mod+enter', onSend, TicketHotKeyScope.NoteInput);
  return (
    <div className="flex flex-col border rounded-lg min-h-14 px-4 py-3  ">
      <BlockEditor
        editor={editor}
        onFocus={() =>
          setHotkeyScopeAndMemorizePreviousScope(TicketHotKeyScope.NoteInput)
        }
        onBlur={() => goBackToPreviousHotkeyScope()}
        className="read-only"
      >
        <AssignMemberInEditor editor={editor} />
      </BlockEditor>
      <div className="flex justify-end">
        <Button
          size="lg"
          className="ml-auto"
          disabled={loading}
          onClick={onSend}
        >
          Send
          <Kbd className="ml-1">
            <IconCommand size={12} />
            <IconCornerDownLeft size={12} />
          </Kbd>
        </Button>
      </div>
    </div>
  );
};
