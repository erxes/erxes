import { useState, useCallback, useMemo, useEffect } from 'react';
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
  useScopedHotkeys,
  useUpload,
  toast,
  Input,
} from 'erxes-ui';
import {
  IconArrowUp,
  IconPaperclip,
  IconX,
  IconCommand,
  IconCornerDownLeft,
  IconMessage2,
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
import { ResponseTemplateSelector } from './ResponseTemplateSelector';
import { getPreviewText } from '@/inbox/types/inbox';
import { useGetResponses } from '@/responseTemplate/hooks/useGetResponses';
import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { ResponseTemplateDropdown } from '@/inbox/conversations/conversation-detail/components/ResponseTemplateDropdown';
export const MessageInput = ({
  conversationId,
}: {
  conversationId: string;
}) => {
  const [isInternalNote, setIsInternalNote] = useAtom(isInternalState);
  const onlyInternal = useAtomValue(onlyInternalState);
  const messageExtraInfo = useAtomValue(messageExtraInfoState);
  const { channels: availableChannels } = useGetChannels();
  const { responses } = useGetResponses({});
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

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [responseTemplateId, setResponseTemplateId] = useState<string | null>(
    null,
  );

  const preparedResponses = useMemo(
    () =>
      (responses || []).map((r) => ({
        ...r,
        preview: getPreviewText(r.content || ''),
      })),
    [responses],
  );

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

  const stripHtml = (html: string): string => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const handleTemplateSelect = async (
    templateContent: string,
    templateId?: string,
  ) => {
    console.log(templateContent, 'templateContent');
    console.log(templateId, 'templateId');
    if (!editor) {
      return toast({ title: 'Editor not ready', variant: 'destructive' });
    }

    const parseTemplateToBlocks = (content: string) => {
      try {
        const parsed = JSON.parse(content);
        return Array.isArray(parsed)
          ? parsed
          : [{ type: 'paragraph', content, props: {} }];
      } catch (e) {
        console.warn('Template JSON parse failed, fallback to plain text:', e);
        const clean = stripHtml(content).trim();
        return [{ type: 'paragraph', content: clean, props: {} }];
      }
    };

    try {
      const blocksToInsert = parseTemplateToBlocks(templateContent);

      const existingBlocks = editor.document;
      if (existingBlocks?.length) {
        await editor.removeBlocks(existingBlocks.map((b) => b.id));
      }

      await editor.insertBlocks(
        blocksToInsert,
        editor.topLevelBlocks[0]?.id,
        'before',
      );

      await editor.focus();
      setShowSuggestions(false);
      setResponseTemplateId(templateId || null);
    } catch (error) {
      console.error('Error inserting template:', error);
      toast({ title: 'Failed to insert template', variant: 'destructive' });
    }
  };

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!showSuggestions) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < suggestions.length - 1 ? prev + 1 : prev,
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
            handleTemplateSelect(
              suggestions[selectedIndex].content,
              suggestions[selectedIndex]._id,
            );
            setShowSuggestions(false);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setShowSuggestions(false);
          break;
      }
    },
    [showSuggestions, selectedIndex, suggestions],
  );

  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  const handleChange = useCallback(async () => {
    const blocks = await editor?.document;
    blocks?.pop();
    setContent(blocks as Block[]);

    const html = await editor?.blocksToHTMLLossy(blocks);
    const plain = html?.replace(/<[^>]+>/g, '')?.trim() || '';

    if (plain.length >= 1) {
      const searchTerm = plain.toLowerCase();
      const found = preparedResponses.filter((t) => {
        const titleMatch = t.name?.toLowerCase().includes(searchTerm);
        const contentMatch = t.preview?.toLowerCase().includes(searchTerm);
        return titleMatch || contentMatch;
      });

      setSuggestions(found.slice(0, 5));
      setShowSuggestions(found.length > 0);
    } else {
      setShowSuggestions(false);
    }

    setMentionedUserIds(getMentionedUserIds(blocks));
  }, [editor, preparedResponses]);

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
        responseTemplateId: responseTemplateId,
      },
      onCompleted: () => {
        toast({ title: 'Message sent!', variant: 'default' });
        if (content?.length) editor?.removeBlocks(content);

        setContent(undefined);
        setMentionedUserIds([]);
        setIsInternalNote(false);
        setAttachments([]);
        setAttachmentPreview(null);
        setShowSuggestions(false);
        setResponseTemplateId(null);
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
    responseTemplateId,
  ]);

  useScopedHotkeys('mod+enter', handleSubmit, InboxHotkeyScope.MessageInput);

  return (
    <div className="p-2 h-full">
      <div
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          'flex flex-col h-full py-4 gap-1 max-w-2xl mx-auto bg-sidebar shadow-xs rounded-lg transition-colors duration-150',
          isInternalNote && 'bg-yellow-50 dark:bg-yellow-950',
        )}
      >
        {showSuggestions && (
          <ResponseTemplateDropdown
            suggestions={suggestions}
            selectedIndex={selectedIndex}
            availableChannels={availableChannels}
            onSelect={(content: string, templateId: string) => {
              handleTemplateSelect(content, templateId);
              setShowSuggestions(false);
            }}
          />
        )}

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
                <span role="img" aria-label="file">
                  📁 {file.name} ({Math.round(file.size / 1024)} KB)
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

          <ResponseTemplateSelector onSelect={handleTemplateSelect}>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <IconMessage2 className="h-4 w-4" />
            </Button>
          </ResponseTemplateSelector>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <IconPaperclip className="h-4 w-4" />
            <Input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileInput}
              multiple
            />
          </Button>

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
