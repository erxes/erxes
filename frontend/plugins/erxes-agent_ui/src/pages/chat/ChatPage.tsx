import React, { useState, useRef, useEffect, useReducer } from 'react';
import { useQuery, useApolloClient } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import {
  IconRobot,
  IconSend,
  IconMessageCircle,
  IconMessage2,
  IconRefresh,
  IconCopy,
  IconCheck,
  IconAlertCircle,
  IconPlus,
  IconTrash,
  IconChevronRight,
  IconSparkles,
  IconTool,
  IconLoader2,
  IconPlayerStopFilled,
} from '@tabler/icons-react';
import {
  Badge,
  Breadcrumb,
  Button,
  Empty,
  Separator,
  Skeleton,
  Textarea,
  Tooltip,
} from 'erxes-ui';
import { PageHeader } from 'ui-modules';
import { MASTRA_AGENTS } from '~/graphql/queries';
import { chatStore, Message, ToolCallInfo } from './chatStore';

// ─── Inline Markdown Nodes ───────────────────────────────────────────────────

type InlineNode =
  | { type: 'text'; value: string }
  | { type: 'bold'; value: string }
  | { type: 'italic'; value: string }
  | { type: 'code'; value: string };

function parseInline(text: string): InlineNode[] {
  const nodes: InlineNode[] = [];
  let i = 0;

  while (i < text.length) {
    if (text[i] === '`') {
      const end = text.indexOf('`', i + 1);
      if (end !== -1) {
        nodes.push({ type: 'code', value: text.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    if (text.slice(i, i + 2) === '**') {
      const end = text.indexOf('**', i + 2);
      if (end !== -1) {
        nodes.push({ type: 'bold', value: text.slice(i + 2, end) });
        i = end + 2;
        continue;
      }
    }

    if (text.slice(i, i + 2) === '__') {
      const end = text.indexOf('__', i + 2);
      if (end !== -1) {
        nodes.push({ type: 'bold', value: text.slice(i + 2, end) });
        i = end + 2;
        continue;
      }
    }

    if (text[i] === '*' && text[i + 1] !== '*') {
      const end = text.indexOf('*', i + 1);
      if (end !== -1 && text[end + 1] !== '*') {
        nodes.push({ type: 'italic', value: text.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    if (text[i] === '_' && text[i + 1] !== '_') {
      const end = text.indexOf('_', i + 1);
      if (end !== -1 && text[end + 1] !== '_') {
        nodes.push({ type: 'italic', value: text.slice(i + 1, end) });
        i = end + 1;
        continue;
      }
    }

    let j = i + 1;
    while (j < text.length && text[j] !== '`' && text[j] !== '*' && text[j] !== '_') j++;
    nodes.push({ type: 'text', value: text.slice(i, j) });
    i = j;
  }

  return nodes;
}

const InlineContent = ({ text }: { text: string }) => (
  <>
    {parseInline(text).map((node, i) => {
      if (node.type === 'bold')
        return <strong key={i} className="font-semibold">{node.value}</strong>;
      if (node.type === 'italic')
        return <em key={i}>{node.value}</em>;
      if (node.type === 'code')
        return (
          <code key={i} className="bg-black/8 dark:bg-white/10 px-1 py-0.5 rounded text-[0.8em] font-mono">
            {node.value}
          </code>
        );
      return <span key={i}>{node.value}</span>;
    })}
  </>
);

// ─── Block Markdown Renderer ─────────────────────────────────────────────────

const BlockContent = ({ text }: { text: string }) => {
  const blocks: React.ReactNode[] = [];
  let key = 0;
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    const hMatch = line.match(/^(#{1,3}) (.+)/);
    if (hMatch) {
      const level = hMatch[1].length;
      const className = [
        'text-base font-bold mt-3 mb-0.5',
        'text-[0.95rem] font-semibold mt-2 mb-0.5',
        'text-sm font-semibold mt-2 mb-0.5',
      ][level - 1];
      const content = <InlineContent text={hMatch[2]} />;
      blocks.push(
        level === 1 ? <h1 key={key++} className={className}>{content}</h1>
        : level === 2 ? <h2 key={key++} className={className}>{content}</h2>
        : <h3 key={key++} className={className}>{content}</h3>
      );
      i++;
      continue;
    }

    if (/^[-*+] /.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^[-*+] /.test(lines[i])) {
        items.push(
          <li key={i} className="leading-relaxed">
            <InlineContent text={lines[i].replace(/^[-*+] /, '')} />
          </li>,
        );
        i++;
      }
      blocks.push(<ul key={key++} className="list-disc pl-4 space-y-0.5 my-1">{items}</ul>);
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items: React.ReactNode[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i])) {
        items.push(
          <li key={i} className="leading-relaxed">
            <InlineContent text={lines[i].replace(/^\d+\. /, '')} />
          </li>,
        );
        i++;
      }
      blocks.push(<ol key={key++} className="list-decimal pl-4 space-y-0.5 my-1">{items}</ol>);
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      blocks.push(<hr key={key++} className="border-border my-2" />);
      i++;
      continue;
    }

    if (line.trim() === '') {
      i++;
      continue;
    }

    const paraLines: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^#{1,3} /.test(lines[i]) &&
      !/^[-*+] /.test(lines[i]) &&
      !/^\d+\. /.test(lines[i]) &&
      !/^---+$/.test(lines[i].trim())
    ) {
      paraLines.push(lines[i]);
      i++;
    }

    if (paraLines.length > 0) {
      blocks.push(
        <p key={key++} className="leading-relaxed">
          {paraLines.reduce<React.ReactNode[]>((acc, pl, pi) => {
            if (pi > 0) acc.push(<br key={`br-${pi}`} />);
            acc.push(<InlineContent key={`il-${pi}`} text={pl} />);
            return acc;
          }, [])}
        </p>,
      );
    }
  }

  return <>{blocks}</>;
};

// ─── Fenced code block splitter + full markdown renderer ─────────────────────

const MarkdownContent = ({ content }: { content: string }) => {
  const segments = content.split(/(```(?:[^\n]*)\n[\s\S]*?```)/g);
  return (
    <div className="space-y-1 text-sm">
      {segments.map((seg, idx) => {
        if (/^```/.test(seg)) {
          const langMatch = seg.match(/^```([^\n]*)\n/);
          const lang = langMatch?.[1]?.trim() || '';
          const code = seg.replace(/^```[^\n]*\n/, '').replace(/\n?```$/, '');
          return (
            <div key={idx} className="rounded-md border border-border overflow-hidden my-2">
              {lang && (
                <div className="px-3 py-1 bg-muted/60 border-b border-border text-[10px] font-mono text-muted-foreground">
                  {lang}
                </div>
              )}
              <pre className="p-3 overflow-x-auto text-xs font-mono leading-relaxed bg-muted/30">
                <code>{code}</code>
              </pre>
            </div>
          );
        }
        return <BlockContent key={idx} text={seg} />;
      })}
    </div>
  );
};

// ─── Copy button ─────────────────────────────────────────────────────────────

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <button
            type="button"
            onClick={handleCopy}
            className="size-6 flex items-center justify-center rounded hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-muted-foreground hover:text-foreground"
          >
            {copied ? (
              <IconCheck className="size-3.5 text-green-600" />
            ) : (
              <IconCopy className="size-3.5" />
            )}
          </button>
        </Tooltip.Trigger>
        <Tooltip.Content>{copied ? 'Copied!' : 'Copy'}</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};

// ─── Waiting indicator ───────────────────────────────────────────────────────
//
// Shown only between sending and the first streamed event — once thinking /
// tool / text events arrive, the live assistant bubble takes over.

const WaitingIndicator = () => (
  <div className="flex justify-start">
    <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2.5">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <IconSparkles className="size-3.5 animate-pulse" />
        <span className="animate-pulse">Thinking…</span>
      </div>
    </div>
  </div>
);

// ─── Thinking section (collapsible) ──────────────────────────────────────────

const ThinkingSection = ({
  thinking,
  streaming,
}: {
  thinking: string;
  streaming?: boolean;
}) => {
  const [expanded, setExpanded] = useState(!!streaming);
  const wasStreaming = useRef(streaming);

  // Auto-expand while the model reasons, auto-collapse once it starts answering.
  useEffect(() => {
    if (wasStreaming.current && !streaming) setExpanded(false);
    wasStreaming.current = streaming;
  }, [streaming]);

  return (
    <div className="mb-2 rounded-lg border border-border/60 bg-background/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <IconChevronRight
          className={`size-3.5 shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`}
        />
        <IconSparkles className={`size-3.5 shrink-0 ${streaming ? 'animate-pulse' : ''}`} />
        <span className={streaming ? 'animate-pulse' : ''}>
          {streaming ? 'Thinking…' : 'Thought process'}
        </span>
      </button>
      {expanded && (
        <div className="px-3 pb-2.5 max-h-48 overflow-auto">
          <p className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">
            {thinking}
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Tool call row (expandable) ──────────────────────────────────────────────

const formatJson = (value: any): string => {
  if (value === undefined) return '';
  if (typeof value === 'string') return value;
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const ToolCallRow = ({ call, streaming }: { call: ToolCallInfo; streaming?: boolean }) => {
  const [expanded, setExpanded] = useState(false);
  const pending = call.result === undefined && streaming;

  return (
    <div className="rounded-lg border border-border/60 bg-background/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-1.5 px-2.5 py-1.5 text-xs hover:bg-black/4 dark:hover:bg-white/5 transition-colors"
      >
        <IconChevronRight
          className={`size-3.5 shrink-0 text-muted-foreground transition-transform ${
            expanded ? 'rotate-90' : ''
          }`}
        />
        <IconTool className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="font-mono truncate flex-1 text-left">{call.toolName}</span>
        {pending ? (
          <IconLoader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
        ) : call.isError ? (
          <IconAlertCircle className="size-3.5 shrink-0 text-destructive" />
        ) : call.result !== undefined ? (
          <IconCheck className="size-3.5 shrink-0 text-green-600" />
        ) : null}
      </button>
      {expanded && (
        <div className="px-3 pb-2.5 space-y-2">
          {call.args !== undefined && (
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                Request
              </p>
              <pre className="text-[11px] font-mono bg-muted/40 rounded-md p-2 overflow-auto max-h-40 whitespace-pre-wrap break-all">
                {formatJson(call.args)}
              </pre>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
              Response
            </p>
            <pre className="text-[11px] font-mono bg-muted/40 rounded-md p-2 overflow-auto max-h-60 whitespace-pre-wrap break-all">
              {pending ? 'Running…' : formatJson(call.result) || '—'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Message bubble ───────────────────────────────────────────────────────────

const MessageBubble = ({ msg }: { msg: Message }) => {
  if (msg.role === 'error') {
    return (
      <div className="flex justify-center">
        <div className="flex items-center gap-2 text-xs text-destructive bg-destructive/8 border border-destructive/20 rounded-lg px-3 py-2 max-w-[80%]">
          <IconAlertCircle className="size-3.5 shrink-0" />
          <span>{msg.content}</span>
        </div>
      </div>
    );
  }

  if (msg.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[78%] bg-primary text-primary-foreground rounded-2xl rounded-br-sm px-4 py-2.5">
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
          <p className="text-[10px] mt-1 text-primary-foreground/60">
            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    );
  }

  // assistant — thinking + tool calls + (possibly still streaming) answer text
  const streaming = !!msg.streaming;
  // The model is reasoning while no answer text has arrived yet.
  const thinkingLive = streaming && !msg.content;

  return (
    <div className="flex justify-start group">
      <div className="max-w-[82%] min-w-0 bg-muted rounded-2xl rounded-bl-sm px-4 py-2.5">
        {msg.thinking && (
          <ThinkingSection thinking={msg.thinking} streaming={thinkingLive} />
        )}
        {msg.toolCalls && msg.toolCalls.length > 0 && (
          <div className="mb-2 space-y-1">
            {msg.toolCalls.map((call, i) => (
              <ToolCallRow key={call.toolCallId ?? i} call={call} streaming={streaming} />
            ))}
          </div>
        )}
        {msg.content ? (
          <MarkdownContent content={msg.content} />
        ) : streaming && !msg.thinking && !msg.toolCalls?.length ? (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-0.5">
            <IconSparkles className="size-3.5 animate-pulse" />
            <span className="animate-pulse">Thinking…</span>
          </div>
        ) : null}
        {streaming && msg.content && (
          <span className="inline-block w-1.5 h-3.5 bg-foreground/60 animate-pulse align-text-bottom" />
        )}
        {!streaming && (
          <div className="flex items-center justify-between gap-2 mt-1.5">
            <p className="text-[10px] text-muted-foreground">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {msg.interrupted && (
                <span className="ml-1.5 text-amber-600 dark:text-amber-500">· stopped</span>
              )}
            </p>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <CopyButton text={msg.content} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

export const ChatPage = () => {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const apolloClient = useApolloClient();

  // Subscribe to store updates
  const [, forceUpdate] = useReducer((x) => x + 1, 0);
  useEffect(() => chatStore.subscribe(forceUpdate), []);

  const { data, loading: agentsLoading } = useQuery(MASTRA_AGENTS);

  const agents = (data?.mastraAgents || []).filter((a: any) => a.isEnabled);
  const selectedAgent = agentId ? agents.find((a: any) => a._id === agentId) ?? null : null;

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const state = agentId ? chatStore.getState(agentId) : undefined;
  const sessions = state?.sessions ?? [];
  const activeThreadId = state?.activeThreadId;
  const isDraft = state?.isDraft ?? false;
  const messages: Message[] = state?.messages ?? [];
  const chatLoading = state?.loading ?? false;
  const messagesLoading = state?.messagesLoading ?? false;

  // Track the viewed agent (clears its unread badge); clear on navigate away.
  useEffect(() => {
    chatStore.setCurrentAgent(agentId);
    return () => { chatStore.setCurrentAgent(undefined); };
  }, [agentId]);

  // Load the agent's persisted sessions once its record is available.
  useEffect(() => {
    if (!agentId || !selectedAgent) return;
    chatStore.loadSessions(apolloClient, agentId, selectedAgent.agentId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId, selectedAgent?.agentId]);

  // Keep the view pinned to the bottom — also while a reply streams (the last
  // message grows without the list length changing).
  const lastMsg = messages[messages.length - 1];
  const lastMsgSize =
    (lastMsg?.content?.length ?? 0) +
    (lastMsg?.thinking?.length ?? 0) +
    (lastMsg?.toolCalls?.length ?? 0);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, chatLoading, lastMsgSize]);

  useEffect(() => {
    if (!chatLoading) textareaRef.current?.focus();
  }, [chatLoading, activeThreadId]);

  const handleNewThread = () => {
    if (!agentId) return;
    chatStore.newDraft(agentId);
  };

  const handleSelectSession = (threadId: string) => {
    if (!agentId || threadId === activeThreadId) return;
    chatStore.selectSession(apolloClient, agentId, threadId);
  };

  const handleDeleteSession = (e: React.MouseEvent, threadId: string) => {
    e.stopPropagation();
    if (!agentId || !selectedAgent) return;
    if (window.confirm('Delete this session and all its messages?')) {
      chatStore.deleteSession(apolloClient, agentId, selectedAgent.agentId, threadId);
    }
  };

  const handleSend = () => {
    if (!input.trim() || !selectedAgent || chatLoading || !agentId) return;
    const message = input.trim();
    setInput('');
    // Fire-and-forget: the store holds the Apollo client reference so the
    // request continues even if the user navigates away before it completes.
    chatStore.sendMessage(apolloClient, agentId, selectedAgent.agentId, message);
  };

  const handleStop = () => {
    if (!agentId || !activeThreadId) return;
    chatStore.stop(agentId, activeThreadId);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
                    <span className="text-muted-foreground text-sm">{selectedAgent.name}</span>
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
        {/* ── Agent sidebar ── */}
        <div className="w-56 border-r flex flex-col shrink-0">
          <div className="px-3 py-2.5 border-b">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Agents
            </p>
          </div>

          <div className="flex-1 overflow-auto">
            {agentsLoading ? (
              <div className="p-3 space-y-1.5">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full rounded-md" />
                ))}
              </div>
            ) : agents.length === 0 ? (
              <div className="p-4 text-center">
                <IconRobot className="size-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No enabled agents.</p>
              </div>
            ) : (
              <div className="p-1.5 space-y-0.5">
                {agents.map((agent: any) => {
                  const isActive = agentId === agent._id;
                  const hasUnread = !isActive && chatStore.hasUnread(agent._id);
                  return (
                    <button
                      key={agent._id}
                      className={`w-full text-left rounded-md px-2.5 py-2 transition-colors hover:bg-accent ${
                        isActive ? 'bg-accent' : ''
                      }`}
                      onClick={() => navigate(`/erxes-agent/chat/${agent._id}`)}
                    >
                      <div className="flex items-start gap-2">
                        <div className="relative shrink-0 mt-0.5">
                          <IconRobot className="size-4 text-muted-foreground" />
                          {hasUnread && (
                            <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-red-500" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate leading-tight">{agent.name}</p>
                          <p className="text-xs text-muted-foreground truncate font-mono mt-0.5">
                            {agent.model}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── Sessions panel ── */}
        {selectedAgent && (
          <div className="w-60 border-r flex flex-col shrink-0">
            <div className="px-3 py-2 border-b flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Sessions
              </p>
              <Button variant="ghost" size="icon" className="size-6" onClick={handleNewThread}>
                <IconPlus className="size-3.5" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-1.5 space-y-0.5">
              {isDraft && (
                <div
                  className={`rounded-md px-2.5 py-2 ${
                    activeThreadId && !sessions.some((s) => s.threadId === activeThreadId)
                      ? 'bg-accent'
                      : ''
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <IconMessage2 className="size-3.5 text-muted-foreground shrink-0" />
                    <p className="text-sm truncate flex-1">New chat</p>
                  </div>
                  <p className="text-[11px] text-muted-foreground pl-5">Unsaved · send a message</p>
                </div>
              )}
              {sessions.length === 0 && !isDraft ? (
                <p className="text-xs text-muted-foreground px-2.5 py-3">No sessions yet.</p>
              ) : (
                sessions.map((s) => {
                  const active = s.threadId === activeThreadId;
                  return (
                    <button
                      key={s.threadId}
                      onClick={() => handleSelectSession(s.threadId)}
                      className={`group/sess w-full text-left rounded-md px-2.5 py-2 transition-colors hover:bg-accent ${
                        active ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <IconMessage2 className="size-3.5 text-muted-foreground shrink-0" />
                        <p className="text-sm truncate flex-1">{s.title}</p>
                        <span
                          role="button"
                          tabIndex={0}
                          onClick={(e) => handleDeleteSession(e, s.threadId)}
                          className="opacity-0 group-hover/sess:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <IconTrash className="size-3.5" />
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground pl-5">
                        {s.messageCount} message{s.messageCount === 1 ? '' : 's'}
                      </p>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ── Chat area ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
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
              {/* Messages */}
              <div className="flex-1 overflow-auto p-4 space-y-3">
                {messagesLoading ? (
                  <div className="p-2 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 w-2/3 rounded-2xl" />
                    ))}
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center gap-2">
                    <IconRobot className="size-10 text-muted-foreground" />
                    <p className="text-base font-medium">{selectedAgent.name}</p>
                    {selectedAgent.description && (
                      <p className="text-sm text-muted-foreground max-w-sm">
                        {selectedAgent.description}
                      </p>
                    )}
                    <Badge variant="secondary" className="font-mono text-xs mt-1">
                      {selectedAgent.provider} · {selectedAgent.model}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      Send a message to start chatting
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, i) => (
                      <MessageBubble key={i} msg={msg} />
                    ))}
                    {chatLoading && lastMsg?.role === 'user' && <WaitingIndicator />}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input bar */}
              <div className="border-t p-3 bg-background">
                <div className="flex gap-2 items-end">
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e: any) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Message ${selectedAgent.name}…`}
                    rows={1}
                    className="flex-1 min-h-[38px] max-h-28 resize-none py-2"
                  />
                  {chatLoading ? (
                    <Tooltip.Provider>
                      <Tooltip>
                        <Tooltip.Trigger asChild>
                          <Button
                            size="icon"
                            variant="outline"
                            className="size-[38px] shrink-0"
                            onClick={handleStop}
                          >
                            <IconPlayerStopFilled className="size-4" />
                          </Button>
                        </Tooltip.Trigger>
                        <Tooltip.Content>Stop generating</Tooltip.Content>
                      </Tooltip>
                    </Tooltip.Provider>
                  ) : (
                    <Button
                      size="icon"
                      className="size-[38px] shrink-0"
                      onClick={handleSend}
                      disabled={!input.trim()}
                    >
                      <IconSend className="size-4" />
                    </Button>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5 pl-0.5">
                  Enter to send · Shift+Enter for new line
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
