import {
  BlockEditor,
  Button,
  Input,
  Kbd,
  Spinner,
  Toggle,
  cn,
  getBlockAttachments,
  getMentionedUserIds,
  readImage,
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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { Block } from '@blocknote/core';
import {
  useDiscordChannelMemberSearch,
  useDiscordConversationParticipants,
} from '@/integrations/discord/hooks/useDiscordSetup';
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
import { messageReplyState } from '../states/messageReplyState';
import type { IAttachment } from 'erxes-ui';

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

const ATTACHMENT_BLOCK_TYPES = new Set(['audio', 'file', 'image', 'video']);

const withoutAttachmentBlocks = (blocks?: Block[]) =>
  blocks?.filter((block) => !ATTACHMENT_BLOCK_TYPES.has(block.type));

const draftKey = (conversationId: string) =>
  `frontline:conversation-draft:${conversationId}`;

type AttachmentPreview = {
  name: string;
  type: string;
  size: number;
  data: string;
};

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
  const [replyTo, setReplyTo] = useAtom(messageReplyState);

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
    setReplyTo(null);
  }, [conversationId, setReplyTo]);

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
  const [attachments, setAttachments] = useState<IAttachment[]>([]);
  const [attachmentPreview, setAttachmentPreview] =
    useState<AttachmentPreview | null>(null);

  const editor = useBlockEditor();
  const restoringDraftRef = useRef(false);
  const { addConversationMessage, loading } = useConversationMessageAdd();

  useEffect(() => {
    if (!editor || !conversationId) return;
    restoringDraftRef.current = true;
    try {
      const stored = window.localStorage.getItem(draftKey(conversationId));
      const blocks = stored ? (JSON.parse(stored) as Block[]) : [];
      editor.replaceBlocks(editor.document, blocks);
      setContent(blocks.length ? blocks : undefined);
    } catch {
      window.localStorage.removeItem(draftKey(conversationId));
      editor.replaceBlocks(editor.document, []);
      setContent(undefined);
    } finally {
      window.setTimeout(() => {
        restoringDraftRef.current = false;
      }, 0);
    }
  }, [conversationId, editor]);

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

      const maximumBytes = isDiscord ? 10 * 1024 * 1024 : 25 * 1024 * 1024;
      const selectedFiles = Array.from(files);
      const oversized = selectedFiles.find((file) => file.size > maximumBytes);
      if (oversized) {
        toast({
          title: `${oversized.name} exceeds the ${
            maximumBytes / 1024 / 1024
          } MB channel limit`,
          variant: 'destructive',
        });
        return;
      }
      if (attachments.length + selectedFiles.length > 10) {
        toast({
          title: 'You can attach up to 10 files to one message',
          variant: 'destructive',
        });
        return;
      }

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
    [attachments.length, isDiscord, t, upload],
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

  const handleDeleteAttachment = (url: string) => {
    setAttachments((prev) => prev.filter((file) => file.url !== url));
    toast({ title: t('attachment-removed'), variant: 'default' });
  };

  const stripHtml = (html: string): string => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const handleTemplateSelect = useCallback(
    async (templateContent: string, templateId?: string) => {
      if (!editor) {
        return toast({ title: t('editor-not-ready'), variant: 'destructive' });
      }

      const parseTemplateToBlocks = (content: string) => {
        try {
          const parsed = JSON.parse(content);
          return Array.isArray(parsed)
            ? parsed
            : [{ type: 'paragraph', content, props: {} }];
        } catch (e) {
          console.warn(
            'Template JSON parse failed, fallback to plain text:',
            e,
          );
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
        toast({
          title: t('failed-to-insert-template'),
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
    [handleTemplateSelect, selectedIndex, showSuggestions, suggestions],
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
    if (restoringDraftRef.current) return;
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
    if (conversationId && blocks?.length) {
      window.localStorage.setItem(
        draftKey(conversationId),
        JSON.stringify(blocks),
      );
    } else if (conversationId) {
      window.localStorage.removeItem(draftKey(conversationId));
    }
  }, [conversationId, editor, pingAgentTyping]);

  const handleSubmit = useCallback(async () => {
    if (!conversationId) return;

    const outgoingBlocks =
      isDiscord && !isInternalNote ? encodeDiscordMentions(content) : content;

    const messageBlocks = isInternalNote
      ? content
      : withoutAttachmentBlocks(outgoingBlocks);
    const sendContent = isInternalNote
      ? JSON.stringify(content)
      : await editor?.blocksToHTMLLossy(messageBlocks);
    const quotedContent =
      replyTo && !replyTo.nativeReply && !isInternalNote
        ? `<blockquote><strong>Replying to</strong><br/>${replyTo.preview.replace(
            /[&<>"']/g,
            (character) =>
              ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
              }[character] || character),
          )}</blockquote>`
        : '';

    const blockAttachments = getBlockAttachments(content || []);
    const paperclipUrls = new Set(attachments.map((a) => a.url));
    const allAttachments = [
      ...attachments,
      ...blockAttachments.filter((a) => !paperclipUrls.has(a.url)),
    ];

    addConversationMessage({
      variables: {
        conversationId,
        content: `${quotedContent}${sendContent || ''}`,
        mentionedUserIds: isDiscord && !isInternalNote ? [] : mentionedUserIds,
        internal: isInternalNote,
        extraInfo: messageExtraInfo,
        attachments: allAttachments,
        responseTemplateId: responseTemplateId,
        ...(!isInternalNote && replyTo?.nativeReply && replyTo.providerMessageId
          ? { replyToMessageId: replyTo.providerMessageId }
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
        setReplyTo(null);
        window.localStorage.removeItem(draftKey(conversationId));
      },
      refetchQueries: [
        'Conversations',
        'ConversationMessages',
        'ConversationCounts',
        'FrontlineInboxSidebarWorkCounts',
      ],
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
    replyTo,
    setReplyTo,
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
          refetchQueries: [
            'Conversations',
            'ConversationMessages',
            'ConversationCounts',
            'FrontlineInboxSidebarWorkCounts',
          ],
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
    <div className="flex h-full items-end p-3">
      <div
        onDrop={handleDrop}
        onKeyDown={handleKeyDown}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          'mx-auto flex max-h-full min-h-28 w-full max-w-3xl flex-col gap-1 rounded-2xl border border-border/70 bg-background/95 py-2 shadow-[0_8px_30px_rgba(15,23,42,0.08)] transition-colors duration-150',
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

        {!isInternalNote && replyTo && (
          <div className="mx-6 mb-1 flex flex-none items-center justify-between gap-3 rounded-md border-l-2 border-primary/60 bg-muted px-3 py-1.5 text-sm">
            <div className="flex min-w-0 items-center gap-2 text-muted-foreground">
              <IconArrowBackUp className="size-4 flex-none" />
              {replyTo.attachment?.type?.startsWith('image') && (
                <img
                  src={readImage(replyTo.attachment.url)}
                  alt={replyTo.attachment.name || 'Reply attachment'}
                  className="size-8 flex-none rounded object-cover"
                />
              )}
              <span className="min-w-0">
                <span className="block truncate text-xs font-medium text-foreground">
                  {replyTo.nativeReply ? 'Replying to' : 'Quoting'}{' '}
                  {replyTo.authorName || 'message'}
                </span>
                <span className="block truncate text-xs">
                  {replyTo.preview}
                </span>
              </span>
            </div>
            <button
              type="button"
              aria-label="Cancel reply"
              onClick={() => setReplyTo(null)}
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
            'min-h-12 max-h-40 w-full flex-none overflow-y-auto',
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
                  onClick={() => handleDeleteAttachment(file.url)}
                  className="text-destructive hover:text-red-700"
                >
                  <IconX size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-1 flex min-w-0 flex-none flex-wrap items-center gap-1 border-t border-border/50 px-2 pt-2 sm:px-4">
          <Toggle
            pressed={isInternalNote}
            size="lg"
            variant="outline"
            className="min-w-20 max-w-full px-2 sm:px-5"
            onPressedChange={() =>
              !onlyInternal && setIsInternalNote(!isInternalNote)
            }
          >
            <span className="truncate">{t('internal-note')}</span>
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

          {isDiscord && !isInternalNote && (
            <PollComposer onSubmit={handleSendPoll} loading={loading} />
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
