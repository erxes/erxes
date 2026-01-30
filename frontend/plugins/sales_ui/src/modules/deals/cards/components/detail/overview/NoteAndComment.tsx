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
  toast,
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
  const [content, setContent] = useState<any>();
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

  const {
    // setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const handleFileUpload = (file: any) => {
    if (!editor) return;
    let url = `${REACT_APP_API_URL}/read-file?key=${encodeURIComponent(
      file.url,
    )}`;

    setFile(file);
    setFileUrl(url);
  };

  const handleChange = async () => {
    const content = await editor?.document;
    content.pop();
    setContent(content);
    const mentionedUserIds = getMentionedUserIds(content);
    setMentionedUserIds(mentionedUserIds);
  };

  function renderBlocks(content: any) {
    let finalContent = content
      .map((block: any) => {
        const text = block.content?.map((c: any) => c.text).join('') ?? '';

        switch (block.type) {
          case 'paragraph':
            return `<p>${text}</p>`;
          case 'heading':
            return `<h${block.props.level}>${text}</h${block.props.level}>`;
          case 'image':
            return `<img src="${block.props.url}" alt="${block.props.caption}" />`;
          default:
            return '';
        }
      })
      .join('');
    if (fileUrl) {
      finalContent += `<img src="${fileUrl}" />`;
    }
    return finalContent;
  }

  const handleNoteSubmit = async () => {
    if (!content) {
      return;
    }

    addInternalNote({
      variables: {
        contentType: 'sales:deal',
        contentTypeId: deal.deal._id,
        content: renderBlocks(content),
        mentionedUserIds,
      },
      onCompleted: () => {
        editor?.removeBlocks(editor?.document);
        setFileUrl('');
        toast({
          title: 'Note added successfully',
          variant: 'success',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      },
      refetchQueries: ['activityLogs'],
    });
  };

  const handleCommentSubmit = async () => {
    if (!content) {
      return;
    }

    addComment({
      variables: {
        comment: {
          content: renderBlocks(content),
          type: 'sales:deal',
          typeId: deal.deal._id,
        },
      },
      onCompleted: () => {
        editor?.removeBlocks(editor?.document);
        setFileUrl('');
        toast({
          title: 'Comment added successfully',
          variant: 'success',
        });
      },
      onError: (error) => {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
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
              onBlur={() => goBackToPreviousHotkeyScope()}
            >
              {<AssignMemberInEditor editor={editor} />}
            </BlockEditor>

            {fileUrl && (
              <div className="px-6 py-2">
                <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-md relative">
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
                {internalNoteLoading ? <Spinner size="sm" /> : <IconArrowUp />}
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
              onBlur={() => goBackToPreviousHotkeyScope()}
            >
              {<AssignMemberInEditor editor={editor} />}
            </BlockEditor>

            {fileUrl && (
              <div className="px-6 py-2">
                <div className="flex items-center gap-2 p-2 bg-gray-100 rounded-md relative">
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
