import {
  BlockEditor,
  Button,
  Input,
  Kbd,
  Spinner,
  Toggle,
  cn,
  getMentionedUserIds,
  toast,
  useBlockEditor,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useUpload,
} from 'erxes-ui';
import {
  IconArrowUp,
  IconCommand,
  IconCornerDownLeft,
  IconMessage2,
  IconPaperclip,
  IconX,
} from '@tabler/icons-react';
import {
  hideMessageInputState,
  isInternalState,
  onlyInternalState,
} from '@/inbox/conversations/conversation-detail/states/isInternalState';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce, useThrottledCallback } from 'use-debounce';
import { useMutation } from '@apollo/client';
import { CONVERSATION_AGENT_TYPING } from '../graphql/mutations/conversationAgentTyping';

import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';

import {
  AssignMemberInEditor,
  EditorMentionItem,
  MentionInEditor,
} from 'ui-modules';
import { Block } from '@blocknote/core';
import { useDiscordConversationParticipants } from '@/integrations/discord/hooks/useDiscordSetup';
import { IntegrationType } from '@/types/Integration';
import { InboxHotkeyScope } from '@/inbox/types/InboxHotkeyScope';
import { ResponseTemplateDropdown } from '@/inbox/conversations/conversation-detail/components/ResponseTemplateDropdown';
import { ResponseTemplateSelector } from './ResponseTemplateSelector';
import { PollComposer, PollDraft } from './PollComposer';
import { getPreviewText } from '@/inbox/types/inbox';
import { messageExtraInfoState } from '../states/messageExtraInfoState';
import { useConversationMessageAdd } from '../hooks/useConversationMessageAdd';
import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { useGetResponses } from '@/responseTemplate/hooks/useGetResponses';

// Replace mention inline nodes with a plain-text Discord token so the user id
// survives HTML serialization + stripping on the way to Discord. The backend
// converts `{@discord:ID}` into Discord's `<@ID>` ping.
const encodeDiscordMentions = (blocks?: Block[]): Block[] | undefined =>
  blocks?.map((block) =>
    Array.isArray(block?.content)
      ? ({
          ...block,
          content: block.content.map(
            (inline: { type?: string; props?: { _id?: string } }) =>
              inline?.type === 'mention'
                ? {
                    type: 'text',
                    text: `{@discord:${inline.props?._id}}`,
                    styles: {},
                  }
                : inline,
          ),
        } as Block)
      : block,
  );

export const MessageInput = ({
  conversationId,
}: {
  conversationId: string;
}) => {
  const [isInternalNote, setIsInternalNote] = useAtom(isInternalState);
  const onlyInternal = useAtomValue(onlyInternalState);
  const setOnlyInternal = useSetAtom(onlyInternalState);
  const hideInput = useAtomValue(hideMessageInputState);
  const { integration } = useConversationContext();
  const isDiscord = integration?.kind === IntegrationType.DISCORD_MESSENGER;
  const messageExtraInfo = useAtomValue(messageExtraInfoState);

  // Discord participants power the type-`@`-to-mention menu in the composer.
  const discordParticipants = useDiscordConversationParticipants(
    conversationId,
    !isDiscord || !conversationId,
  );
  const discordMentionItems = useMemo<EditorMentionItem[]>(
    () =>
      discordParticipants.map((participant) => ({
        id: participant.userId,
        fullName: participant.name || 'Discord user',
        avatar: participant.avatar,
      })),
    [discordParticipants],
  );
  useEffect(() => {
    const isLead = integration?.kind === 'lead';
    setOnlyInternal(isLead);
    setIsInternalNote(isLead);
  }, [integration?.kind, conversationId, setOnlyInternal, setIsInternalNote]);

  const { channels: availableChannels } = useGetChannels();
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue] = useDebounce(searchValue, 300);

  const { responses } = useGetResponses({
    skip: !debouncedSearchValue,
    variables: {
      filter: {
        searchValue: debouncedSearchValue || undefined,
      },
    },
  });
  const [content, setContent] = useState<Block[]>();
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [attachmentPreview, setAttachmentPreview] = useState<any>(null);

  const editor = useBlockEditor();
  const { addConversationMessage, loading } = useConversationMessageAdd();

  // Relay the agent's "is typing…" to the channel while composing a reply.
  // Discord-only for now (the generic backend mutation no-ops for integrations
  // that don't implement typing yet). Heartbeat at 10s stays under the backend's
  // 15s self-cap so the indicator stays lit while typing; it's cleared on blur
  // and when the reply is sent. Internal notes never leak to the customer.
  const [notifyAgentTyping] = useMutation(CONVERSATION_AGENT_TYPING);
  const pingAgentTyping = useThrottledCallback(
    () => {
      if (isDiscord && !isInternalNote && conversationId) {
        notifyAgentTyping({ variables: { conversationId, typing: true } });
      }
    },
    10000,
    { leading: true, trailing: false },
  );
  const stopAgentTyping = useCallback(() => {
    pingAgentTyping.cancel();
    if (isDiscord && conversationId) {
      notifyAgentTyping({ variables: { conversationId, typing: false } });
    }
  }, [isDiscord, conversationId, notifyAgentTyping, pingAgentTyping]);
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

  useEffect(() => {
    if (!debouncedSearchValue) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (preparedResponses?.length > 0) {
      setSuggestions(preparedResponses.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [preparedResponses, debouncedSearchValue]);

  const handleChange = useCallback(async () => {
    const blocks = await editor?.document;
    blocks?.pop();
    setContent(blocks as Block[]);

    const html = await editor?.blocksToHTMLLossy(blocks);
    const plain = html?.replace(/<[^>]+>/g, '')?.trim() || '';

    if (plain.length >= 1) {
      setSearchValue(plain);
      pingAgentTyping();
    } else {
      setSearchValue('');
      setSuggestions([]);
      setShowSuggestions(false);
    }

    setMentionedUserIds(getMentionedUserIds(blocks));
  }, [editor, pingAgentTyping]);

  const handleSubmit = useCallback(async () => {
    if (!conversationId) return;

    // For a Discord reply, encode each mention node as a plain-text token
    // `{@discord:USER_ID}` (angle brackets don't survive HTML stripping); the
    // backend turns it into Discord's `<@USER_ID>` ping. mentionedUserIds is for
    // teammate notifications, so it's cleared for Discord replies.
    const outgoingBlocks =
      isDiscord && !isInternalNote ? encodeDiscordMentions(content) : content;

    const sendContent = isInternalNote
      ? JSON.stringify(content)
      : await editor?.blocksToHTMLLossy(outgoingBlocks);

    addConversationMessage({
      variables: {
        conversationId,
        content: sendContent,
        mentionedUserIds:
          isDiscord && !isInternalNote ? [] : mentionedUserIds,
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
      refetchQueries: ['Conversations'],
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
    isDiscord,
    messageExtraInfo,
    attachments,
    editor,
    addConversationMessage,
    setIsInternalNote,
    responseTemplateId,
  ]);

  // Polls go straight to Discord (no text body); resolve `true` so the composer
  // dialog closes + resets only on a successful send.
  const handleSendPoll = useCallback(
    async (poll: PollDraft): Promise<boolean> => {
      if (!conversationId) return false;
      try {
        await addConversationMessage({
          variables: { conversationId, content: '', internal: false, poll },
          refetchQueries: ['Conversations'],
        });
        toast({ title: 'Poll sent!', variant: 'default' });
        return true;
      } catch (err) {
        toast({
          title: `Failed to send poll: ${(err as Error).message}`,
          variant: 'destructive',
        });
        return false;
      }
    },
    [conversationId, addConversationMessage],
  );

  useScopedHotkeys('mod+enter', handleSubmit, InboxHotkeyScope.MessageInput);

  if (hideInput) return null;

  return (
    <div className="p-2 h-full">
      <div
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          'flex flex-col h-full py-4 gap-1 max-w-2xl mx-auto bg-sidebar shadow-xs rounded-lg transition-colors duration-150',
          isInternalNote && 'bg-warning/20',
        )}
      >
        {showSuggestions && !isInternalNote && (
          <ResponseTemplateDropdown
            suggestions={suggestions}
            selectedIndex={selectedIndex}
            availableChannels={availableChannels}
            onSelect={(content: string, templateId?: string) => {
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
          onBlur={() => {
            goBackToPreviousHotkeyScope();
            stopAgentTyping();
          }}
        >
          {isInternalNote && <AssignMemberInEditor editor={editor} />}
          {isDiscord && !isInternalNote && (
            <MentionInEditor
              editor={editor}
              participants={discordMentionItems}
            />
          )}
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
          <div className="px-6 mt-2 text-sm text-muted-foreground space-y-1">
            {attachments.map((file, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-muted px-3 py-1 rounded-md"
              >
                <span role="img" aria-label="file">
                  📁 {file.name} ({Math.round(file.size / 1024)} KB)
                </span>
                <button
                  onClick={() => handleDeleteAttachment(file.name)}
                  className="text-destructive hover:text-red-700"
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

          {isDiscord && !isInternalNote && (
            <PollComposer onSubmit={handleSendPoll} loading={loading} />
          )}

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
