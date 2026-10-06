import {
  BlockEditor,
  Button,
  Input,
  IAttachment,
  Kbd,
  Spinner,
  Toggle,
  cn,
  getBlockAttachments,
  getMentionedUserIds,
  toast,
  useBlockEditor,
  usePreviousHotkeyScope,
  useScopedHotkeys,
  useUpload,
} from 'erxes-ui';
import {
  IconArrowBackUp,
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
import { useApolloClient, useMutation } from '@apollo/client';
import { CONVERSATION_AGENT_TYPING } from '../graphql/mutations/conversationAgentTyping';

import { useConversationContext } from '@/inbox/conversations/conversation-detail/hooks/useConversationContext';
import { useTranslation } from 'react-i18next';

import {
  AssignMemberInEditor,
  EditorMentionItem,
  MentionInEditor,
} from 'ui-modules';
import { Block, PartialBlock } from '@blocknote/core';
import type { IResponseTemplate } from '@/responseTemplate/types';
import { getMessageDraftBlocks } from '../utils/messageDraft';
import { telegramReplyToState } from '@/integrations/telegram/telegramReplyToState';
import {
  useDiscordChannelMemberSearch,
  useDiscordConversationParticipants,
} from '@/integrations/discord/hooks/useDiscordSetup';
import { discordReplyToState } from '@/integrations/discord/states/discordReplyToState';
import { IntegrationType } from '@/types/Integration';
import { InboxHotkeyScope } from '@/inbox/types/InboxHotkeyScope';
import { ResponseTemplateDropdown } from '@/inbox/conversations/conversation-detail/components/ResponseTemplateDropdown';
import { ResponseTemplateSelector } from './ResponseTemplateSelector';
import { PollComposer, PollDraft } from './PollComposer';
import { SendSurveyDialog } from './SendSurveyDialog';
import { getPreviewText } from '@/inbox/types/inbox';
import { messageExtraInfoState } from '../states/messageExtraInfoState';
import { useConversationMessageAdd } from '../hooks/useConversationMessageAdd';
import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { useGetResponses } from '@/responseTemplate/hooks/useGetResponses';

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
  const { t } = useTranslation('frontline');
  const client = useApolloClient();
  const [isInternalNote, setIsInternalNote] = useAtom(isInternalState);
  const onlyInternal = useAtomValue(onlyInternalState);
  const setOnlyInternal = useSetAtom(onlyInternalState);
  const hideInput = useAtomValue(hideMessageInputState);
  const { integration } = useConversationContext();
  const isDiscord = integration?.kind === IntegrationType.DISCORD_MESSENGER;
  const isTelegram = integration?.kind === IntegrationType.TELEGRAM_MESSENGER;
  const supportsReply = isDiscord || isTelegram;
  const isMessenger = integration?.kind === IntegrationType.ERXES_MESSENGER;
  const messageExtraInfo = useAtomValue(messageExtraInfoState);
  const [discordReplyTo, setDiscordReplyTo] = useAtom(discordReplyToState);
  const [telegramReplyTo, setTelegramReplyTo] = useAtom(telegramReplyToState);
  const replyTo = isTelegram
    ? telegramReplyTo?.conversationId === conversationId
      ? telegramReplyTo
      : null
    : discordReplyTo;
  const clearReply = useCallback(() => {
    setDiscordReplyTo(null);
    setTelegramReplyTo(null);
  }, [setDiscordReplyTo, setTelegramReplyTo]);
  const activeRefetchQueries = useCallback(
    () =>
      [...client.getObservableQueries('active').values()]
        .filter((query) =>
          [
            'Conversations',
            'ConversationMessages',
            'ConversationCounts',
            'FrontlineInboxSidebarWorkCounts',
          ].includes(query.queryName ?? ''),
        )
        .map((query) => ({
          query: query.options.query,
          variables: query.variables,
        })),
    [client],
  );

  const discordParticipants = useDiscordConversationParticipants(
    conversationId,
    !isDiscord || !conversationId,
  );
  const { search: searchDiscordMembers, status: discordMemberStatus } =
    useDiscordChannelMemberSearch(
      conversationId,
      !isDiscord || !conversationId,
    );
  const discordMentionItems = useMemo<EditorMentionItem[]>(() => {
    const byUserId = new Map<string, EditorMentionItem>();
    for (const person of discordParticipants) {
      if (person.userId && !byUserId.has(person.userId)) {
        byUserId.set(person.userId, {
          id: person.userId,
          fullName: person.name || 'Discord user',
          avatar: person.avatar,
        });
      }
    }
    return [...byUserId.values()];
  }, [discordParticipants]);
  const searchDiscordMentionItems = useCallback(
    async (query: string): Promise<EditorMentionItem[]> => {
      const found = await searchDiscordMembers(query);

      return found
        .filter((person) => person.userId)
        .map((person) => ({
          id: person.userId,
          fullName: person.name || 'Discord user',
          avatar: person.avatar,
        }));
    },
    [searchDiscordMembers],
  );
  const discordMentionNote = useMemo(() => {
    switch (discordMemberStatus) {
      case 'TRUNCATED':
        return 'Too many matches — keep typing to narrow down';
      case 'FORBIDDEN':
        return 'Bot cannot read this channel — showing people who have chatted';
      case 'ERROR':
        return 'Member search unavailable — showing people who have chatted';
      default:
        return undefined;
    }
  }, [discordMemberStatus]);
  useEffect(() => {
    const isLead = integration?.kind === 'lead';
    setOnlyInternal(isLead);
    setIsInternalNote(isLead);
  }, [integration?.kind, conversationId, setOnlyInternal, setIsInternalNote]);

  useEffect(() => {
    clearReply();
  }, [conversationId, clearReply]);

  const { channels: availableChannels } = useGetChannels();
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue] = useDebounce(searchValue, 300);

  const { responses } = useGetResponses({
    skip: isTelegram || !debouncedSearchValue,
    variables: {
      filter: {
        searchValue: debouncedSearchValue || undefined,
      },
    },
  });
  const [content, setContent] = useState<Block[]>();
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<IAttachment[]>([]);
  const [attachmentPreview, setAttachmentPreview] = useState<{
    name: string;
    type: string;
    data?: string;
  } | null>(null);

  const editor = useBlockEditor();
  const { addConversationMessage, loading } = useConversationMessageAdd();

  const [notifyAgentTyping] = useMutation(CONVERSATION_AGENT_TYPING);
  const pingAgentTyping = useThrottledCallback(
    () => {
      if (isDiscord && !isInternalNote && conversationId) {
        notifyAgentTyping({
          variables: { conversationId, typing: true },
        }).catch(() => undefined);
      }
    },
    10000,
    { leading: true, trailing: false },
  );
  const stopAgentTyping = useCallback(() => {
    pingAgentTyping.cancel();
    if (isDiscord && conversationId) {
      notifyAgentTyping({
        variables: { conversationId, typing: false },
      }).catch(() => undefined);
    }
  }, [isDiscord, conversationId, notifyAgentTyping, pingAgentTyping]);
  const { upload, isLoading } = useUpload();
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const [suggestions, setSuggestions] = useState<
    (IResponseTemplate & { preview: string })[]
  >([]);
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
          toast({
            title: t('uploading-file', 'Uploading file...'),
            variant: 'default',
          }),
        afterRead: ({ result, fileInfo }) =>
          setAttachmentPreview({
            ...fileInfo,
            data: typeof result === 'string' ? result : undefined,
          }),
        afterUpload: ({ response, fileInfo, status }) => {
          if (status !== 'ok' || typeof response !== 'string') {
            setAttachmentPreview(null);
            toast({
              title: t('file-upload-failed', 'File upload failed'),
              variant: 'destructive',
            });
            return;
          }
          setAttachments((prev) => [...prev, { ...fileInfo, url: response }]);
          setAttachmentPreview(null);
          toast({
            title: t(
              'file-uploaded-successfully',
              'File uploaded successfully!',
            ),
            variant: 'default',
          });
        },
      });
    },
    [upload, t],
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
    toast({
      title: t('attachment-removed', 'Attachment removed'),
      variant: 'default',
    });
  };

  const handleTemplateSelect = useCallback(
    async (templateContent: string, templateId?: string) => {
      if (!editor) {
        return toast({
          title: t('editor-not-ready', 'Editor not ready'),
          variant: 'destructive',
        });
      }

      const parseTemplateToBlocks = (content: string) => {
        try {
          const parsed: unknown = JSON.parse(content);
          return Array.isArray(parsed)
            ? (parsed as PartialBlock[])
            : [{ type: 'paragraph' as const, content, props: {} }];
        } catch {
          const clean =
            new DOMParser()
              .parseFromString(content, 'text/html')
              .body.textContent?.trim() || '';
          return [{ type: 'paragraph' as const, content: clean, props: {} }];
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
      } catch {
        toast({
          title: t('failed-to-insert-template', 'Failed to insert template'),
          variant: 'destructive',
        });
      }
    },
    [editor, t],
  );

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
    [showSuggestions, selectedIndex, suggestions, handleTemplateSelect],
  );

  useEffect(() => {
    setSelectedIndex(-1);
  }, [suggestions]);

  useEffect(() => {
    if (isTelegram || !debouncedSearchValue) {
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
  }, [preparedResponses, debouncedSearchValue, isTelegram]);

  const handleChange = useCallback(async () => {
    const blocks = getMessageDraftBlocks(editor?.document ?? []);
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

    setMentionedUserIds(
      getMentionedUserIds(
        blocks.map((block) => ({
          content: Array.isArray(block.content)
            ? block.content.flatMap((item) =>
                item.type === 'mention' &&
                'props' in item &&
                '_id' in item.props &&
                typeof item.props._id === 'string'
                  ? [{ type: 'mention', props: { _id: item.props._id } }]
                  : [],
              )
            : [],
        })),
      ),
    );
  }, [editor, pingAgentTyping]);

  const handleSubmit = useCallback(async () => {
    if (!conversationId) return;

    const outgoingBlocks =
      isDiscord && !isInternalNote ? encodeDiscordMentions(content) : content;

    const sendContent = isInternalNote
      ? JSON.stringify(content)
      : await editor?.blocksToHTMLLossy(outgoingBlocks);

    const blockAttachments = getBlockAttachments(content || []);
    const paperclipUrls = new Set(attachments.map((a) => a.url));
    const allAttachments = [
      ...attachments,
      ...blockAttachments.filter((a) => !paperclipUrls.has(a.url)),
    ];

    addConversationMessage({
      variables: {
        conversationId,
        content: sendContent,
        mentionedUserIds: isDiscord && !isInternalNote ? [] : mentionedUserIds,
        internal: isInternalNote,
        extraInfo: messageExtraInfo,
        attachments: allAttachments,
        responseTemplateId: responseTemplateId,
        ...(supportsReply && !isInternalNote && replyTo
          ? { replyToMessageId: replyTo.messageId }
          : {}),
      },
      onCompleted: () => {
        toast({
          title: isInternalNote
            ? t('internal-note-saved', 'Internal note saved')
            : t('message-sent', 'Message sent!'),
          variant: 'default',
        });
        if (content?.length) editor?.removeBlocks(content);

        setContent(undefined);
        setMentionedUserIds([]);
        setIsInternalNote(onlyInternal);
        setAttachments([]);
        setAttachmentPreview(null);
        setShowSuggestions(false);
        setResponseTemplateId(null);
        clearReply();
      },
      refetchQueries: activeRefetchQueries,
      onError: (err) =>
        toast({
          title: t('failed-to-send', 'Failed to send: {{message}}', {
            message: err.message,
          }),
          variant: 'destructive',
        }),
    });
  }, [
    conversationId,
    content,
    mentionedUserIds,
    isInternalNote,
    isDiscord,
    replyTo,
    supportsReply,
    clearReply,
    onlyInternal,
    messageExtraInfo,
    attachments,
    editor,
    addConversationMessage,
    setIsInternalNote,
    responseTemplateId,
    activeRefetchQueries,
    t,
  ]);

  const handleSendPoll = useCallback(
    async (poll: PollDraft): Promise<boolean> => {
      if (!conversationId) return false;
      try {
        await addConversationMessage({
          variables: {
            conversationId,
            content: '',
            internal: false,
            poll,
            ...(replyTo ? { replyToMessageId: replyTo.messageId } : {}),
          },
          refetchQueries: activeRefetchQueries,
        });
        clearReply();
        toast({ title: t('poll-sent', 'Poll sent!'), variant: 'default' });
        return true;
      } catch (err) {
        toast({
          title: t('failed-to-send', 'Failed to send: {{message}}', {
            message: err instanceof Error ? err.message : 'Poll send failed',
          }),
          variant: 'destructive',
        });
        return false;
      }
    },
    [
      conversationId,
      addConversationMessage,
      replyTo,
      clearReply,
      activeRefetchQueries,
      t,
    ],
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
        {showSuggestions && !isInternalNote && !isTelegram && (
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

        {isInternalNote && (
          <p className="mx-6 text-xs text-muted-foreground">
            {t(
              'internal-note-only-visible-to-team',
              'Only visible to your team; this is not sent to the customer.',
            )}
          </p>
        )}
        {supportsReply && !isInternalNote && replyTo && (
          <div className="mx-6 mb-1 flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-1.5 text-sm">
            <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
              <IconArrowBackUp className="size-4 flex-none" />
              <span className="truncate">
                {t('replying-to', 'Replying to:')} {replyTo.preview}
              </span>
            </div>
            <button
              type="button"
              aria-label="Cancel reply"
              onClick={clearReply}
              className="flex-none text-muted-foreground hover:text-foreground"
            >
              <IconX size={14} aria-hidden="true" />
            </button>
          </div>
        )}

        <BlockEditor
          editor={editor}
          sideMenu={!isTelegram}
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
              searchItems={searchDiscordMentionItems}
              statusNote={discordMentionNote}
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

        <div className="flex min-w-0 flex-wrap items-center gap-1 px-2 mt-2 sm:gap-4 sm:px-6">
          <Toggle
            pressed={isInternalNote}
            size="lg"
            variant="outline"
            className="min-w-20 max-w-full px-2 sm:px-5"
            onPressedChange={() =>
              !onlyInternal && setIsInternalNote(!isInternalNote)
            }
          >
            <span className="truncate">
              {t('internal-note', 'Internal Note')}
            </span>
          </Toggle>

          {!isInternalNote && (
            <ResponseTemplateSelector onSelect={handleTemplateSelect}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <IconMessage2 className="h-4 w-4" />
              </Button>
            </ResponseTemplateSelector>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 flex-none rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
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

          {supportsReply && !isInternalNote && (
            <PollComposer
              onSubmit={handleSendPoll}
              loading={loading}
              provider={isTelegram ? 'Telegram' : 'Discord'}
            />
          )}

          {isMessenger && !isInternalNote && (
            <SendSurveyDialog
              conversationId={conversationId}
              channelId={integration?.channelId}
            />
          )}

          <Button
            size="lg"
            className="ml-auto flex-none"
            disabled={
              loading ||
              isLoading ||
              (!content?.length && attachments.length === 0)
            }
            onClick={handleSubmit}
          >
            {loading || isLoading ? <Spinner size="sm" /> : <IconArrowUp />}
            {isInternalNote ? t('save-note', 'Save note') : t('send', 'Send')}
            <Kbd className="ml-1 hidden sm:flex">
              <IconCommand size={12} />
              <IconCornerDownLeft size={12} />
            </Kbd>
          </Button>
        </div>
      </div>
    </div>
  );
};
