import {
  IconArrowUp,
  IconCommand,
  IconCornerDownLeft,
  IconPaperclip,
} from '@tabler/icons-react';
import {
  BlockEditor,
  Button,
  Kbd,
  Spinner,
  Toggle,
  cn,
  getMentionedUserIds,
  useBlockEditor,
  usePreviousHotkeyScope,
  useQueryState,
  useScopedHotkeys,
} from 'erxes-ui';
import { useState } from 'react';
import { AssignMemberInEditor } from 'ui-modules';
import { useConversationMessageAdd } from '../hooks/useConversationMessageAdd';
import { Block } from '@blocknote/core';
import { InboxHotkeyScope } from '@/inbox/types/InboxHotkeyScope';
import { useAtom, useAtomValue } from 'jotai';
import { messageExtraInfoState } from '../states/messageExtraInfoState';
import {
  isInternalState,
  onlyInternalState,
} from '@/inbox/conversations/conversation-detail/states/isInternalState';

export const MessageInput = () => {
  const [conversationId] = useQueryState('conversationId');
  const [isInternalNote, setIsInternalNote] = useAtom(isInternalState);
  const onlyInternal = useAtomValue(onlyInternalState);
  const [content, setContent] = useState<Block[]>();
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const messageExtraInfo = useAtomValue(messageExtraInfoState);
  const editor = useBlockEditor();
  const { addConversationMessage, loading } = useConversationMessageAdd();
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const handleChange = async () => {
    const content = await editor?.document;
    content.pop();
    setContent(content as Block[]);
    const mentionedUserIds = getMentionedUserIds(content);
    setMentionedUserIds(mentionedUserIds);
  };

  const handleSubmit = async () => {
    if (content?.length === 0) {
      return;
    }

    const sendContent = isInternalNote
      ? JSON.stringify(content)
      : await editor?.blocksToHTMLLossy(content);

    addConversationMessage({
      variables: {
        conversationId,
        content: sendContent,
        mentionedUserIds,
        internal: isInternalNote,
        extraInfo: messageExtraInfo,
      },
      onCompleted: () => {
        setContent(undefined);
        editor?.removeBlocks(content as Block[]);
        setMentionedUserIds([]);
        setIsInternalNote(false);
      },
    });
  };

  useScopedHotkeys('mod+enter', handleSubmit, InboxHotkeyScope.MessageInput);

  return (
    <div className="p-2 h-full">
      <div
        className={cn(
          'flex flex-col h-full py-4 gap-1 max-w-2xl mx-auto bg-sidebar shadow-xs rounded-lg',
          isInternalNote && 'bg-yellow-50 dark:bg-yellow-950',
        )}
      >
        <BlockEditor
          editor={editor}
          onChange={handleChange}
          disabled={loading}
          className={cn(
            'h-full w-full overflow-y-auto',
            isInternalNote && 'internal-note',
          )}
          onFocus={() =>
            setHotkeyScopeAndMemorizePreviousScope(
              InboxHotkeyScope.MessageInput,
            )
          }
          onBlur={() => goBackToPreviousHotkeyScope()}
        >
          {isInternalNote && <AssignMemberInEditor editor={editor} />}
        </BlockEditor>
        <div className="flex px-6 gap-4">
          <Toggle
            pressed={isInternalNote}
            size="lg"
            variant="outline"
            onPressedChange={() => {
              if (onlyInternal) {
                return;
              }
              setIsInternalNote(!isInternalNote);
            }}
          >
            Internal Note
          </Toggle>
          <Button size="icon" variant="outline" className="size-8">
            <IconPaperclip />
          </Button>
          <Button
            size="lg"
            className="ml-auto"
            disabled={loading || content?.length === 0}
            onClick={handleSubmit}
          >
            {loading ? <Spinner size="sm" /> : <IconArrowUp />}
            Send
            <Kbd className="ml-1">
              <IconCommand size={12} />
              <IconCornerDownLeft size={12} />
            </Kbd>
          </Button>
        </div>
      </div>
    </div>
  );
};
