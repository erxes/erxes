import {
  BlockEditor,
  Button,
  Tabs,
  cn,
  getMentionedUserIds,
  useBlockEditor,
  usePreviousHotkeyScope,
  REACT_APP_API_URL,
  readImage,
  Spinner,
} from 'erxes-ui';
import {
  IconArrowUp,
  IconMessageDots,
  IconNote,
  IconPaperclip,
  IconX,
} from '@tabler/icons-react';

import { AssignMemberInEditor } from 'ui-modules';
import { Block } from '@blocknote/core';
import { useState } from 'react';
import { useAddInternalNote } from '../../../hooks/useAddInternalNote';
import { useAddComment } from '../../../hooks/useAddComment';
import AttachmentUploader from './attachments/AttachmentUploader';

const SalesNoteAndComment = (deal: any) => {
  const [content, setContent] = useState<Block[]>();
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);

  const editor = useBlockEditor();

  const {
    addInternalNote,
    loading: internalNoteLoading,
    error: internalNoteError,
  } = useAddInternalNote();
  const {
    addComment,
    loading: commentLoading,
    error: commentError,
  } = useAddComment();
  const [file, setFile] = useState<any>(null);
  const [fileUrl, setFileUrl] = useState<string>('');
  const [sendContent, setSendContent] = useState<string>('');

  const {
    // setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const handleFileUpload = (file: any) => {
    if (!editor) return;
    let url = `${REACT_APP_API_URL}/read-file?key=${encodeURIComponent(
      file.url,
    )}`;
    console.log('file', file);
    console.log('URL', url);

    setFile(file);
    setFileUrl(url);
  };

  const handleChange = async () => {
    const content = await editor?.document;
    content.pop();
    setContent(content as Block[]);
    const mentionedUserIds = getMentionedUserIds(content);
    setMentionedUserIds(mentionedUserIds);
  };

  const handleNoteSubmit = async () => {
    if (!content || content?.length === 0) {
      return;
    }

    const html = await editor?.blocksToHTMLLossy(content);

    const textContent = html?.replace(/<[^>]+>/g, '')?.trim() || '';

    const sendContentA = fileUrl
      ? `${textContent} <img src="${fileUrl}" alt="${file.name}" />`
      : textContent;

    setSendContent(sendContentA);
    addInternalNote({
      variables: {
        contentType: 'sales:deal',
        contentTypeId: deal.deal._id,
        content: sendContent,
        mentionedUserIds,
      },
      refetchQueries: ['activityLogs'],
      onCompleted: () => {
        setFile(null);
        setContent(undefined);
        setSendContent('');
        console.log('sendContent', sendContent);
      },
    });
  };

  const handleCommentSubmit = async () => {
    if (content?.length === 0) {
      return;
    }

    const html = await editor?.blocksToHTMLLossy(content);

    const textContent = html?.replace(/<[^>]+>/g, '')?.trim() || '';

    const sendContentA = fileUrl
      ? `${textContent} <img src="${fileUrl}" alt="${file.name}" />`
      : textContent;

    setSendContent(sendContentA);

    addComment({
      variables: {
        comment: {
          content: sendContent,
          type: 'sales:deal',
          typeId: deal.deal._id,
        },
      },
      onCompleted: () => {
        setFile(null);
        setContent(undefined);
        setSendContent('');
        console.log('sendContent', sendContent);
      },
    });
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
              disabled={internalNoteLoading}
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

            {/* Display uploaded file */}
            {fileUrl && (
              <div className="px-6 py-2">
                <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-md relative">
                  <IconPaperclip size={16} className="text-gray-600" />
                  <img src={readImage(fileUrl)} width="100" height="100" />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFile(null);
                      setFileUrl('');
                    }}
                    className="ml-auto p-1 h-6 w-6 hover:bg-gray-200"
                  >
                    <IconX size={14} />
                  </Button>
                </div>
              </div>
            )}

            <div className="flex px-6 gap-4">
              <AttachmentUploader type="note" onFileUpload={handleFileUpload} />
              <Button
                size="lg"
                className="ml-auto"
                disabled={internalNoteLoading || content?.length === 0}
                onClick={handleNoteSubmit}
              >
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
              disabled={commentLoading}
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
                disabled={commentLoading || content?.length === 0}
                onClick={handleCommentSubmit}
              >
                {commentLoading ? <Spinner size="sm" /> : <IconArrowUp />}
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
