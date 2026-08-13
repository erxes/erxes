import {
  BlockEditor,
  Badge,
  Button,
  Input,
  Kbd,
  Spinner,
  Toggle,
  cn,
  getBlockAttachments,
  IAttachment,
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
  IconNote,
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
import { useTranslation } from 'react-i18next';

import {
  AssignMemberInEditor,
  EditorMentionItem,
  MentionInEditor,
} from 'ui-modules';
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
import { getPreviewText } from '@/inbox/types/inbox';
import { messageExtraInfoState } from '../states/messageExtraInfoState';
import { useConversationMessageAdd } from '../hooks/useConversationMessageAdd';
import { useGetChannels } from '@/channels/hooks/useGetChannels';
import { useGetResponses } from '@/responseTemplate/hooks/useGetResponses';
import { IResponseTemplate } from '@/responseTemplate/types';

type AttachmentPreview = Omit<IAttachment, 'url'> & { data: string };
type TemplateSuggestion = IResponseTemplate & { preview: string };
type MessageEditorBlock = ReturnType<typeof useBlockEditor>['document'][number];

const stripHtml = (html: string): string => {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container.textContent || container.innerText || '';
};

const getMentionId = (inline: unknown): string | undefined => {
  if (
    !inline ||
    typeof inline !== 'object' ||
    !('type' in inline) ||
    inline.type !== 'mention' ||
    !('props' in inline) ||
    !inline.props ||
    typeof inline.props !== 'object' ||
    !('_id' in inline.props) ||
    typeof inline.props._id !== 'string'
  ) {
    return undefined;
  }

  return inline.props._id;
};

const getMessageMentionedUserIds = (blocks: MessageEditorBlock[]): string[] =>
  blocks.flatMap((block) =>
    Array.isArray(block.content)
      ? block.content.flatMap((inline) => {
          const mentionId = getMentionId(inline);
          return mentionId ? [mentionId] : [];
        })
      : [],
  );

const encodeDiscordMentions = (
  blocks?: MessageEditorBlock[],
): MessageEditorBlock[] | undefined =>
  blocks?.map((block) =>
    Array.isArray(block?.content)
      ? ({
          ...block,
          content: block.content.map((inline) => {
            const mentionId = getMentionId(inline);
            return mentionId
              ? {
                  type: 'text',
                  text: `{@discord:${mentionId}}`,
                  styles: {},
                }
              : inline;
          }),
        } as MessageEditorBlock)
      : block,
  );

export const MessageInput = ({
  conversationId,
}: {
  conversationId: string;
}) => {
  const { t } = useTranslation('frontline');
  const [isInternalNote, setIsInternalNote] = useAtom(isInternalState);
  const onlyInternal = useAtomValue(onlyInternalState);
  const setOnlyInternal = useSetAtom(onlyInternalState);
  const hideInput = useAtomValue(hideMessageInputState);
  const { integration } = useConversationContext();
  const isDiscord = integration?.kind === IntegrationType.DISCORD_MESSENGER;
  const messageExtraInfo = useAtomValue(messageExtraInfoState);
  const [discordReplyTo, setDiscordReplyTo] = useAtom(discordReplyToState);

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
    setDiscordReplyTo(null);
  }, [conversationId, setDiscordReplyTo]);

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
  const [content, setContent] = useState<MessageEditorBlock[]>();
  const [mentionedUserIds, setMentionedUserIds] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<IAttachment[]>([]);
  const [attachmentPreview, setAttachmentPreview] =
    useState<AttachmentPreview | null>(null);

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

  const [suggestions, setSuggestions] = useState<TemplateSuggestion[]>([]);
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
          toast({ title: t('uploading-file'), variant: 'default' }),
        afterRead: ({ result, fileInfo }) =>
          setAttachmentPreview({ ...fileInfo, data: result }),
        afterUpload: ({ response, fileInfo }) => {
          setAttachments((prev) => [...prev, { ...fileInfo, url: response }]);
          setAttachmentPreview(null);
          toast({ title: t('file-uploaded-successfully'), variant: 'default' });
        },
      });
    },
    [t, upload],
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
    toast({ title: t('attachment-removed'), variant: 'default' });
  };

  const handleTemplateSelect = useCallback(
    (templateContent: string, templateId?: string) => {
      if (!editor) {
        return toast({ title: t('editor-not-ready'), variant: 'destructive' });
      }

      const parseTemplateToBlocks = (content: string) => {
        try {
          const parsed = JSON.parse(content);
          return Array.isArray(parsed)
            ? parsed
            : [{ type: 'paragraph', content, props: {} }];
        } catch {
          const clean = stripHtml(content).trim();
          return [{ type: 'paragraph', content: clean, props: {} }];
        }
      };

      try {
        const blocksToInsert = parseTemplateToBlocks(templateContent);

        const existingBlocks = editor.document;
        if (existingBlocks?.length) {
          editor.removeBlocks(existingBlocks.map((b) => b.id));
        }

        editor.insertBlocks(
          blocksToInsert,
          editor.document[0]?.id,
          'before',
        );

        editor.focus();
        setShowSuggestions(false);
        setResponseTemplateId(templateId || null);
      } catch {
        toast({ title: t('failed-to-insert-template'), variant: 'destructive' });
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
    [handleTemplateSelect, showSuggestions, selectedIndex, suggestions],
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
    const blocks = editor?.document;
    blocks?.pop();
    setContent(blocks);

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

    setMentionedUserIds(getMessageMentionedUserIds(blocks || []));
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
        ...(isDiscord && !isInternalNote && discordReplyTo
          ? { replyToMessageId: discordReplyTo.messageId }
          : {}),
      },
      onCompleted: () => {
        toast({ title: t('message-sent'), variant: 'default' });
        if (content?.length) editor?.removeBlocks(content);

        setContent(undefined);
        setMentionedUserIds([]);
        setIsInternalNote(false);
        setAttachments([]);
        setAttachmentPreview(null);
        setShowSuggestions(false);
        setResponseTemplateId(null);
        setDiscordReplyTo(null);
      },
      refetchQueries: ['Conversations'],
      onError: (err) =>
        toast({
          title: t('failed-to-send', { message: err.message }),
          variant: 'destructive',
        }),
    });
  }, [
    conversationId,
    content,
    mentionedUserIds,
    isInternalNote,
    isDiscord,
    discordReplyTo,
    setDiscordReplyTo,
    messageExtraInfo,
    attachments,
    editor,
    addConversationMessage,
    setIsInternalNote,
    responseTemplateId,
    t,
  ]);

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
    <div className="h-full p-3">
      <div
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          'mx-auto flex h-full max-w-2xl flex-col overflow-hidden rounded-xl border bg-background shadow-sm transition-colors duration-150',
          isInternalNote && 'border-warning/40 bg-warning/5',
        )}
      >
        <div className="flex items-center gap-3 border-b px-4 py-2.5">
          <div
            className={cn(
              'flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary',
              isInternalNote && 'bg-warning/15 text-warning',
            )}
          >
            {isInternalNote ? (
              <IconNote className="size-4" />
            ) : (
              <IconMessage2 className="size-4" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold">
              {isInternalNote ? t('internal-note') : t('reply')}
            </p>
            <p className="text-xs text-muted-foreground">
              {isInternalNote ? t('private') : t('customer')}
            </p>
          </div>
          <Badge
            variant={isInternalNote ? 'warning' : 'default'}
            className="ml-auto"
          >
            {isInternalNote ? t('internal-note') : t('reply')}
          </Badge>
        </div>

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

        {isDiscord && !isInternalNote && discordReplyTo && (
          <div className="mx-6 mb-1 flex items-center justify-between gap-2 rounded-md bg-muted px-3 py-1.5 text-sm">
            <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
              <IconArrowBackUp className="size-4 flex-none" />
              <span className="truncate">
                Replying to: {discordReplyTo.preview}
              </span>
            </div>
            <button
              type="button"
              aria-label="Cancel reply"
              onClick={() => setDiscordReplyTo(null)}
              className="flex-none text-muted-foreground hover:text-foreground"
            >
              <IconX size={14} aria-hidden="true" />
            </button>
          </div>
        )}

        <BlockEditor
          editor={editor}
          onChange={handleChange}
          disabled={loading}
          className={cn(
            'h-full min-h-32 w-full overflow-y-auto px-2 py-1',
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
          <div className="mx-4 mb-2 rounded-lg border bg-muted/30 p-3">
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
          <div className="mx-4 mt-2 space-y-1 text-sm text-muted-foreground">
            {attachments.map((file) => (
              <div
                key={file.url}
                className="flex items-center justify-between bg-muted px-3 py-1 rounded-md"
              >
                <span role="img" aria-label="file">
                  📁 {file.name} ({Math.round(file.size / 1024)} KB)
                </span>
                <button
                  type="button"
                  aria-label={t('attachment-removed')}
                  onClick={() => handleDeleteAttachment(file.name)}
                  className="text-destructive hover:text-red-700"
                >
                  <IconX size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto flex min-w-0 flex-wrap items-center gap-1 border-t bg-muted/20 px-2 py-3 sm:gap-4 sm:px-6">
          <Toggle
            pressed={isInternalNote}
            size="sm"
            variant="outline"
            className="min-w-20 max-w-full px-2 sm:px-5"
            onPressedChange={() =>
              !onlyInternal && setIsInternalNote(!isInternalNote)
            }
          >
            <span className="truncate">{t('internal-note')}</span>
          </Toggle>

          <ResponseTemplateSelector onSelect={handleTemplateSelect}>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-none rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <IconMessage2 className="h-4 w-4" />
            </Button>
          </ResponseTemplateSelector>

          <Button
            type="button"
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

          {isDiscord && !isInternalNote && (
            <PollComposer onSubmit={handleSendPoll} loading={loading} />
          )}

          <Button
            type="button"
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
            {t('send')}
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
