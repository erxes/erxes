import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useApolloClient } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import {
  IconArrowDown,
  IconFileUpload,
  IconMessageCircle,
  IconPlus,
} from '@tabler/icons-react';
import { Breadcrumb, Button, Empty, Separator } from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { ChatAttachment, ApprovedOp } from '~/modules/chat/types';
import { chatStore } from '~/modules/chat/store/chatStore';
import {
  useChatAgents,
  useAttachmentsEnabled,
} from '~/modules/chat/hooks/useChatAgents';
import { useAgentChatView } from '~/modules/chat/hooks/useChatView';
import { useMastraThreads } from '~/modules/chat/hooks/useMastraThreads';
import { useRenameMastraThread } from '~/modules/chat/hooks/useRenameMastraThread';
import { useRemoveMastraThread } from '~/modules/chat/hooks/useRemoveMastraThread';
import { useAttachments } from '~/modules/chat/hooks/useAttachments';
import { useSessionBootstrap } from '~/modules/chat/hooks/useSessionBootstrap';
import { AgentRail } from '~/modules/chat/components/AgentRail';
import { SessionList } from '~/modules/chat/components/SessionList';
import { MessageList } from '~/modules/chat/components/MessageList';
import { Composer } from '~/modules/chat/components/Composer';
import { ApprovalBar } from '~/modules/chat/components/ApprovalBar';
import { pendingApproval } from '~/modules/chat/lib/approval';
import '~/modules/chat/chat.css';

// Distance (px) from the bottom under which we keep following streamed output.
const SCROLL_PIN_THRESHOLD = 120;
// Distance (px) from the bottom past which the "Latest" jump button appears.
const SCROLL_BUTTON_THRESHOLD = 280;

export const ChatPage = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const [railOpen, setRailOpen] = useState(!agentId);
  const apolloClient = useApolloClient();

  const { agents, loading: agentsLoading } = useChatAgents();
  const attachmentsEnabled = useAttachmentsEnabled();

  // The route is keyed by the agent record _id, but inbound links (e.g.
  // Schedules → View output) may carry the agent slug — accept both.
  const selectedAgent = useMemo(
    () =>
      agentId
        ? (agents.find((a) => a._id === agentId || a.agentId === agentId) ??
          null)
        : null,
    [agents, agentId],
  );

  const view = useAgentChatView(agentId);
  const {
    activeThreadId,
    isDraft,
    reasoningEffort,
    messages,
    loading: chatLoading,
    messagesLoading,
    streamTick,
  } = view;

  // The persisted session list lives in the Apollo cache, not the chat store.
  const { threads, loading: threadsLoading } = useMastraThreads(
    selectedAgent?.agentId,
  );
  const sessionsLoaded = !!selectedAgent && !threadsLoading;
  const { renameThread } = useRenameMastraThread();
  const { removeThread } = useRemoveMastraThread(selectedAgent?.agentId);

  const [input, setInput] = useState('');
  const [showScrollDown, setShowScrollDown] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesBoxRef = useRef<HTMLDivElement>(null);
  // Whether the view is pinned to the bottom. Gates streaming auto-scroll so a
  // user who scrolled up to read history isn't yanked back on every token.
  const atBottomRef = useRef(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const attachments = useAttachments(attachmentsEnabled);

  // Session state-machine (slug→id redirect, ?thread= deep-link, current-agent
  // tracking, bootstrap/re-home) lives in the hook so the view keeps only its
  // own scroll/focus/autogrow effects.
  useSessionBootstrap(selectedAgent, threads, sessionsLoaded);

  // Keep the view pinned to the bottom — also while a reply streams (the last
  // message grows without the list length changing). The store bumps streamTick
  // on every live update, so following it re-fires this effect per token.
  useEffect(() => {
    if (atBottomRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, chatLoading, streamTick]);

  // Switching threads re-pins to the bottom of the freshly loaded conversation.
  useEffect(() => {
    atBottomRef.current = true;
  }, [activeThreadId]);

  useEffect(() => {
    if (!chatLoading) textareaRef.current?.focus();
  }, [chatLoading, activeThreadId]);

  // Auto-grow the textarea with its content (capped via max-h on the element).
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [input]);

  const handleNewThread = () => {
    if (agentId) chatStore.newDraft(agentId);
  };

  const handleSelectSession = (threadId: string) => {
    if (!agentId || threadId === activeThreadId) return;
    chatStore.selectSession(apolloClient, agentId, threadId);
  };

  const handleDeleteSession = (
    e: React.MouseEvent | React.KeyboardEvent,
    threadId: string,
  ) => {
    e.stopPropagation();
    if (!agentId || !selectedAgent) return;
    if (!window.confirm('Delete this session and all its messages?')) return;
    // The cached list filter (hook) + local state teardown (store); the
    // bootstrap effect re-selects the next session if this one was active.
    removeThread(threadId);
    chatStore.discardThread(agentId, threadId);
  };

  const handleRenameSession = (id: string, threadId: string, title: string) => {
    renameThread(id, threadId, title);
  };

  const sendMessage = useCallback(
    (
      message: string,
      atts: ChatAttachment[],
      approvedOperations?: ApprovedOp[],
      hidden?: boolean,
    ) => {
      if (!selectedAgent || !agentId) return;
      // Sending re-pins to the bottom so the user follows their own message.
      atBottomRef.current = true;
      // Fire-and-forget: the store holds the Apollo client reference so the
      // request continues even if the user navigates away before it completes.
      chatStore.sendMessage(
        apolloClient,
        agentId,
        selectedAgent.agentId,
        message,
        atts,
        approvedOperations,
        hidden,
      );
    },
    [apolloClient, agentId, selectedAgent],
  );

  // A destructive op the agent is waiting on (derived from the last turn) — drives
  // the approval bar above the composer. Both actions continue the turn without a
  // visible user bubble (hidden send): Approve replays the gated op, Deny cancels.
  const approval = pendingApproval(messages);

  const handleApprove = () => {
    if (chatLoading || !approval) return;
    sendMessage('Approved.', [], approval.operations, true);
  };

  const handleDeny = () => {
    if (chatLoading) return;
    sendMessage('Cancelled — do not delete or merge anything.', [], undefined, true);
  };

  const handleSend = () => {
    if (
      !input.trim() ||
      !selectedAgent ||
      chatLoading ||
      !agentId ||
      attachments.uploadsInFlight
    )
      return;
    const message = input.trim();
    const atts = attachments.collectReady();
    attachments.clear();
    setInput('');
    sendMessage(message, atts);
  };

  // Re-ask the question that produced the last reply (with its attachments).
  // Reads messages from the store rather than closing over the `messages` array
  // so this callback stays referentially stable across streamed tokens — the
  // memoized message rows depend on it not changing every chunk.
  const handleRegenerate = useCallback(() => {
    if (!agentId || chatLoading) return;
    const msgs = chatStore.getState(agentId).messages;
    const lastUser = [...msgs].reverse().find((m) => m.role === 'user');
    if (lastUser) sendMessage(lastUser.content, lastUser.attachments || []);
  }, [agentId, chatLoading, sendMessage]);

  // Stable rating handler so the memoized message rows don't re-render per token.
  const handleRate = useCallback(
    (messageId: string, rating: 1 | -1) => {
      if (!agentId || !activeThreadId) return;
      chatStore.rateMessage(
        apolloClient,
        agentId,
        activeThreadId,
        messageId,
        rating,
      );
    },
    [apolloClient, agentId, activeThreadId],
  );

  const handleStop = () => {
    if (agentId && activeThreadId) chatStore.stop(agentId, activeThreadId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape' && chatLoading) {
      e.preventDefault();
      handleStop();
    }
  };

  const handleMessagesScroll = () => {
    const el = messagesBoxRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    atBottomRef.current = distanceFromBottom < SCROLL_PIN_THRESHOLD;
    setShowScrollDown(distanceFromBottom > SCROLL_BUTTON_THRESHOLD);
  };

  const scrollToBottom = () => {
    atBottomRef.current = true;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const showAgentRail = !selectedAgent || railOpen;

  return (
    <div className="flex flex-col h-full">
      <PageHeader>
        <PageHeader.Start>
          <Breadcrumb>
            <Breadcrumb.List className="gap-1">
              <Breadcrumb.Item>
                <Button variant="ghost" size="sm">
                  <IconMessageCircle />
                  Chat
                </Button>
              </Breadcrumb.Item>
              {selectedAgent && (
                <>
                  <Breadcrumb.Separator />
                  <Breadcrumb.Item>
                    <span className="text-muted-foreground text-sm">
                      {selectedAgent.name}
                    </span>
                  </Breadcrumb.Item>
                </>
              )}
            </Breadcrumb.List>
          </Breadcrumb>
          <Separator.Inline />
          <PageHeader.FavoriteToggleButton />
        </PageHeader.Start>
        {selectedAgent && (
          <PageHeader.End>
            <Button variant="outline" size="sm" onClick={handleNewThread}>
              <IconPlus className="size-3.5" />
              New chat
            </Button>
          </PageHeader.End>
        )}
      </PageHeader>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Side panel: AgentRail ↔ SessionList slide ── */}
        <div className="relative shrink-0 border-r overflow-hidden w-60">
          <div
            className="absolute inset-0 transition-transform duration-200 ease-in-out"
            style={{
              transform: showAgentRail ? 'translateX(0)' : 'translateX(-100%)',
            }}
          >
            <AgentRail
              agents={agents}
              loading={agentsLoading}
              activeAgentId={agentId}
              onSelect={(id) => {
                navigate(`/erxes-agent/chat/${id}`);
                setRailOpen(false);
              }}
            />
          </div>
          {selectedAgent && agentId && (
            <div
              className="absolute inset-0 transition-transform duration-200 ease-in-out"
              style={{
                transform: showAgentRail ? 'translateX(100%)' : 'translateX(0)',
              }}
            >
              <SessionList
                agentId={agentId}
                sessions={threads}
                sessionsLoaded={sessionsLoaded}
                isDraft={isDraft}
                activeThreadId={activeThreadId}
                onSelect={handleSelectSession}
                onNew={handleNewThread}
                onDelete={handleDeleteSession}
                onRename={handleRenameSession}
                onBack={() => setRailOpen(true)}
              />
            </div>
          )}
        </div>

        {/* ── Chat area ── */}
        <div
          className="flex-1 flex flex-col overflow-hidden relative"
          onDragEnter={attachments.onDragEnter}
          onDragOver={attachments.onDragOver}
          onDragLeave={attachments.onDragLeave}
          onDrop={attachments.onDrop}
        >
          {attachments.isDragging && selectedAgent && (
            <div className="ea-pop absolute inset-3 z-20 rounded-2xl border-2 border-dashed border-primary/50 bg-primary/6 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 pointer-events-none">
              <IconFileUpload className="size-9 text-primary" />
              <p className="text-sm font-medium text-primary">
                Drop files to attach
              </p>
              <p className="text-xs text-muted-foreground">
                images · PDF · Excel · Word · CSV
              </p>
            </div>
          )}

          {selectedAgent && chatLoading && (
            <div
              aria-hidden
              className="ea-ambient pointer-events-none absolute inset-0 z-0 overflow-hidden"
            >
              <span className="ea-ambient-blob ea-ambient-blob-1" />
              <span className="ea-ambient-blob ea-ambient-blob-2" />
            </div>
          )}

          {!selectedAgent ? (
            <div className="flex-1 flex items-center justify-center">
              <Empty>
                <Empty.Header>
                  <Empty.Media variant="icon">
                    <IconMessageCircle />
                  </Empty.Media>
                  <Empty.Title>Select an agent</Empty.Title>
                  <Empty.Description>
                    Choose an agent from the sidebar to start a conversation.
                  </Empty.Description>
                </Empty.Header>
              </Empty>
            </div>
          ) : (
            <>
              <MessageList
                agent={selectedAgent}
                messages={messages}
                messagesLoading={messagesLoading}
                chatLoading={chatLoading}
                attachmentsEnabled={attachmentsEnabled}
                ratingEnabled={!!agentId && !!activeThreadId}
                boxRef={messagesBoxRef}
                endRef={messagesEndRef}
                onScroll={handleMessagesScroll}
                onSuggestion={(text) => {
                  setInput(text);
                  textareaRef.current?.focus();
                }}
                onRegenerate={handleRegenerate}
                onRate={handleRate}
              />

              {showScrollDown && (
                <button
                  type="button"
                  onClick={scrollToBottom}
                  className="ea-pop absolute bottom-28 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 rounded-full border border-border bg-background/95 backdrop-blur px-3 py-1.5 text-xs shadow-md hover:border-primary/40 hover:text-primary transition-colors"
                >
                  <IconArrowDown className="size-3.5" />
                  Latest
                </button>
              )}

              {approval && !chatLoading && (
                <ApprovalBar
                  prompt={approval.prompt}
                  busy={chatLoading}
                  onApprove={handleApprove}
                  onDeny={handleDeny}
                />
              )}

              <Composer
                input={input}
                onInputChange={setInput}
                onSend={handleSend}
                onStop={handleStop}
                onKeyDown={handleKeyDown}
                chatLoading={chatLoading}
                attachmentsEnabled={attachmentsEnabled}
                attachments={attachments}
                agentName={selectedAgent.name}
                reasoningEffort={reasoningEffort}
                onReasoningEffortChange={(effort) =>
                  chatStore.setReasoningEffort(agentId!, effort)
                }
                textareaRef={textareaRef}
                fileInputRef={fileInputRef}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
