import { useState, useCallback } from 'react';
import {
  BlockEditor,
  Button,
  Toggle,
  Kbd,
  Spinner,
  cn,
  getMentionedUserIds,
  useBlockEditor,
  usePreviousHotkeyScope,
  useQueryState,
  useScopedHotkeys,
  useUpload,
  toast,
  Input,
  Label,
} from 'erxes-ui';
import {
  IconArrowUp,
  IconPaperclip,
  IconX,
  IconCommand,
  IconCornerDownLeft,
} from '@tabler/icons-react';
import { useAtom, useAtomValue } from 'jotai';
import { Block } from '@blocknote/core';

import { useConversationMessageAdd } from '../hooks/useConversationMessageAdd';
import { AssignMemberInEditor } from 'ui-modules';
import { InboxHotkeyScope } from '@/inbox/types/InboxHotkeyScope';
import {
  isInternalState,
  onlyInternalState,
} from '@/inbox/conversations/conversation-detail/states/isInternalState';
import { messageExtraInfoState } from '../states/messageExtraInfoState';

export const MessageInput = () => {
  const [conversationId] = useQueryState('conversationId');
  const [isInternalNote, setIsInternalNote] = useAtom(isInternalState);
  const onlyInternal = useAtomValue(onlyInternalState);
  const messageExtraInfo = useAtomValue(messageExtraInfoState);

  const [content, setContent] = useState<Block[]>();
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [attachmentPreview, setAttachmentPreview] = useState<any>(null);

  const editor = useBlockEditor();
  const { addConversationMessage, loading } = useConversationMessageAdd();
  const { upload, isLoading } = useUpload();
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  /** --- File Upload --- */
  const handleFileUpload = useCallback(
    (files: FileList) => {
      if (!files?.length) return;

      upload({
        files,
        beforeUpload: () =>
          toast({ title: 'Uploading file...', variant: 'default' }),
        afterRead: ({ result, fileInfo }) =>
          setAttachmentPreview({ ...fileInfo, data: result }),
        afterUpload: ({ response, fileInfo }) => {
          setAttachments((prev) => [...prev, { ...fileInfo, url: response }]);
          setAttachmentPreview(null);
          toast({ title: 'File uploaded successfully!', variant: 'default' });
        },
      });
    },
    [upload],
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    handleFileUpload(e.target.files);

    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDeleteAttachment = (name: string) => {
    setAttachments((prev) => prev.filter((f) => f.name !== name));
    toast({ title: 'Attachment removed', variant: 'default' });
  };

  const handleChange = useCallback(async () => {
    const blocks = await editor?.document;
    blocks?.pop();
    setContent(blocks as Block[]);
    setMentionedUserIds(getMentionedUserIds(blocks));
  }, [editor]);

  const handleSubmit = useCallback(async () => {
    if (!conversationId) return;

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
        attachments,
      },
      onCompleted: () => {
        toast({ title: 'Message sent!', variant: 'default' });
        if (content?.length) editor?.removeBlocks(content);

        setContent(undefined);
        setMentionedUserIds([]);
        setIsInternalNote(false);
        setAttachments([]);
        setAttachmentPreview(null);
      },
      onError: (err) =>
        toast({
          title: `Failed to send: ${err.message}`,
          variant: 'destructive',
        }),
    });
  }, [
    conversationId,
    content,
    mentionedUserIds,
    isInternalNote,
    messageExtraInfo,
    attachments,
    editor,
    addConversationMessage,
    setIsInternalNote,
  ]);

  useScopedHotkeys('mod+enter', handleSubmit, InboxHotkeyScope.MessageInput);

  return (
    <div className="p-2 h-full">
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          'flex flex-col h-full py-4 gap-1 max-w-2xl mx-auto bg-sidebar shadow-xs rounded-lg transition-colors duration-150',
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
          onBlur={goBackToPreviousHotkeyScope}
        >
          {isInternalNote && <AssignMemberInEditor editor={editor} />}
        </BlockEditor>

        {attachmentPreview && (
          <div className="px-6 mb-2">
            <p className="text-sm">{attachmentPreview.name}</p>
            {attachmentPreview.type.startsWith('image/') && (
              <img
                src={attachmentPreview.data}
                alt="preview"
                className="max-w-[400px] max-h-[300px] rounded-lg shadow-sm mt-1"
              />
            )}
          </div>
        )}

        {attachments.length > 0 && (
          <div className="px-6 mt-2 text-sm text-gray-500 space-y-1">
            {attachments.map((file, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md"
              >
                <span>
                  <span role="img" aria-label="file">
                    📁
                  </span>{' '}
                  {file.name} ({Math.round(file.size / 1024)} KB)
                </span>
                <button
                  onClick={() => handleDeleteAttachment(file.name)}
                  className="text-red-500 hover:text-red-700"
                >
                  <IconX size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex px-6 gap-4 items-center mt-2">
          <Toggle
            pressed={isInternalNote}
            size="lg"
            variant="outline"
            onPressedChange={() =>
              !onlyInternal && setIsInternalNote(!isInternalNote)
            }
          >
            Internal Note
          </Toggle>

          <Label htmlFor="file-upload">
            <Button asChild size="icon" variant="outline" className="size-8">
              <IconPaperclip />
            </Button>
          </Label>
          <Input
            id="file-upload"
            type="file"
            onChange={handleFileInput}
            multiple
            style={{ display: 'none' }}
          />

          <Button
            size="lg"
            className="ml-auto"
            disabled={
              loading ||
              isLoading ||
              (!content?.length && attachments.length === 0)
            }
            onClick={handleSubmit}
          >
            {loading || isLoading ? <Spinner size="sm" /> : <IconArrowUp />}
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
