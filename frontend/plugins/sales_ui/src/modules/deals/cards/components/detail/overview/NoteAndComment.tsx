import {
  BlockEditor,
  Button,
  Spinner,
  Tabs,
  cn,
  getMentionedUserIds,
  toast,
  useBlockEditor,
  usePreviousHotkeyScope,
} from 'erxes-ui';
import {
  IconArrowUp,
  IconMessageDots,
  IconNote,
  IconPaperclip,
} from '@tabler/icons-react';

import { AssignMemberInEditor } from 'ui-modules';
import { Block } from '@blocknote/core';
import { useState } from 'react';
import { useAddInternalNote } from '../../../hooks/useAddInternalNote';
import { INTERNAL_NOTE_DETAIL } from '@/deals/graphql/queries/InternalNoteQueries';
import { useApolloClient, useQuery } from '@apollo/client';

const SalesNoteAndComment = ({
  contentTypeId,
  contentType,
}: {
  contentTypeId: string;
  contentType: string;
}) => {
  const [content, setContent] = useState<Block[]>();
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const { addInternalNote, loading } = useAddInternalNote();
  const client = useApolloClient();
  const editor = useBlockEditor(); // Add this interface above the component or near other types

  const {
    // setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const handleChange = async () => {
    const content = await editor?.document;
    content.pop();
    setContent(content as Block[]);
    const mentionedUserIds = getMentionedUserIds(content);
    setMentionedUserIds(mentionedUserIds);
  };

  const handleNoteSubmit = async () => {
    addInternalNote({
      variables: {
        mentionedUserIds,
        content: JSON.stringify(content),
        contentType,
        contentTypeId,
      },
      onCompleted: (data) => {
        editor?.removeBlocks(editor?.document);
        console.log(data?.internalNotesAdd?._id);
        if (data) {
          client.query({
            query: INTERNAL_NOTE_DETAIL,
            variables: {
              _id: data?.internalNotesAdd?._id,
            },
          });
        }
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
        });
      },
    });

    // addConversationMessage({
    //   variables: {
    //     conversationId,
    //     content: sendContent,
    //     mentionedUserIds,
    //     internal: isInternalNote,
    //     extraInfo: messageExtraInfo,
    //   },
    //   onCompleted: () => {
    //     setContent(undefined);
    //     editor?.removeBlocks(content as Block[]);
    //     setMentionedUserIds([]);
    //     setIsInternalNote(false);
    //   },
    // });
  };

  const handleCommentSubmit = async () => {
    if (content?.length === 0) {
      return;
    }
  };

  return (
    <div className="flex flex-col pb-4 px-4 max-w-3xl">
      <Tabs
        defaultValue="note"
        className="flex flex-col h-full px-1 md:px-2 shadow-none"
      >
        <Tabs.List className="grid grid-cols-2 p-1 bg-muted mb-3 md:mb-4 h-full rounded-lg border-none">
          <Tabs.Trigger asChild value="note">
            <Button
              variant={'outline'}
              className="bg-transparent data-[state=active]:bg-background data-[state=inactive]:shadow-none"
            >
              <IconNote size={16} /> New note
            </Button>
          </Tabs.Trigger>
          <Tabs.Trigger asChild value="comment">
            <Button
              variant={'outline'}
              className="bg-transparent data-[state=active]:bg-background data-[state=inactive]:shadow-none"
            >
              <IconMessageDots size={16} /> New comment
            </Button>
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="note" className="h-full">
          <div
            className={cn(
              'flex flex-col h-full pt-4 pb-2 gap-1 max-w-3xl mx-auto bg-sidebar shadow-xs rounded-lg',
            )}
          >
            <BlockEditor
              editor={editor}
              onChange={handleChange}
              disabled={loading}
              className={cn('h-full w-full overflow-y-auto', 'internal-note')}
              // onFocus={() =>
              //   setHotkeyScopeAndMemorizePreviousScope(
              //     InboxHotkeyScope.MessageInput,
              //   )
              // }
              onBlur={() => goBackToPreviousHotkeyScope()}
            >
              {<AssignMemberInEditor editor={editor} />}
            </BlockEditor>
            <div className="flex px-6 gap-4">
              <Button variant="outline">
                <IconPaperclip /> Add attachment
              </Button>
              <Button
                size="lg"
                className="ml-auto"
                // disabled={loading || content?.length === 0}
                onClick={handleNoteSubmit}
              >
                {/* {loading ? <Spinner size="small" /> : <IconArrowUp />} */}
                Add note
              </Button>
            </div>
          </div>
        </Tabs.Content>
        <Tabs.Content
          value="comment"
          className="h-full shadow-none border-none rounded-none"
        >
          <div
            className={cn(
              'flex flex-col h-full py-4 gap-1 max-w-3xl mx-auto bg-sidebar shadow-xs rounded-lg',
            )}
          >
            <BlockEditor
              editor={editor}
              onChange={handleChange}
              // disabled={loading}
              className={cn('h-full w-full overflow-y-auto', 'internal-note')}
              // onFocus={() =>
              //   setHotkeyScopeAndMemorizePreviousScope(
              //     InboxHotkeyScope.MessageInput,
              //   )
              // }
              onBlur={() => goBackToPreviousHotkeyScope()}
            >
              {<AssignMemberInEditor editor={editor} />}
            </BlockEditor>
            <div className="flex px-6 gap-4">
              <Button variant="outline">
                <IconPaperclip /> Add attachment
              </Button>
              <Button
                size="lg"
                className="ml-auto"
                disabled={loading || content?.length === 0}
                onClick={handleCommentSubmit}
              >
                {loading ? <Spinner size="sm" /> : <IconArrowUp />}
                Add comment
              </Button>
            </div>
          </div>
        </Tabs.Content>
      </Tabs>
    </div>
  );
};

export default SalesNoteAndComment;
