import React, { useState, useRef, useEffect, useReducer } from 'react';
import { useQuery, useApolloClient } from '@apollo/client';
import { useNavigate, useParams } from 'react-router-dom';
import {
  IconRobot,
  IconSend,
  IconMessageCircle,
  IconRefresh,
  IconCopy,
  IconCheck,
  IconAlertCircle,
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
import { chatStore, Message } from './chatStore';

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

// ─── Typing indicator ─────────────────────────────────────────────────────────

const TypingIndicator = () => (
  <div className="flex justify-start">
    <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-3">
      <div className="flex gap-1 items-center h-4">
        <span className="size-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]" />
        <span className="size-1.5 bg-muted-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]" />
        <span className="size-1.5 bg-muted-foreground/50 rounded-full animate-bounce" />
      </div>
    </div>
  </div>
);

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

  // assistant
  return (
    <div className="flex justify-start group">
      <div className="max-w-[82%] bg-muted rounded-2xl rounded-bl-sm px-4 py-2.5">
        <MarkdownContent content={msg.content} />
        <div className="flex items-center justify-between gap-2 mt-1.5">
          <p className="text-[10px] text-muted-foreground">
            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <CopyButton text={msg.content} />
          </div>
        </div>
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

  const thread = agentId ? chatStore.getThread(agentId) : undefined;
  const messages: Message[] = thread?.messages ?? [];
  const chatLoading = thread?.loading ?? false;

  // Register the currently-viewed agent so the store knows not to mark it unread,
  // and clear it when the user navigates away.
  useEffect(() => {
    chatStore.setCurrentAgent(agentId);
    return () => { chatStore.setCurrentAgent(undefined); };
  }, [agentId]);

  // Initialise a thread the first time the user opens an agent's chat
  useEffect(() => {
    if (!agentId) return;
    chatStore.initThread(agentId);
  }, [agentId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, chatLoading]);

  useEffect(() => {
    if (!chatLoading) textareaRef.current?.focus();
  }, [chatLoading]);

  const handleNewThread = () => {
    if (!agentId) return;
    chatStore.newThread(agentId);
  };

  const handleSend = () => {
    if (!input.trim() || !selectedAgent || chatLoading || !agentId) return;
    const message = input.trim();
    setInput('');
    // Fire-and-forget: the store holds the Apollo client reference so the
    // request continues even if the user navigates away before it completes.
    chatStore.sendMessage(apolloClient, agentId, selectedAgent.agentId, message);
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
              <IconRefresh className="size-3.5" />
              New Thread
            </Button>
          </PageHeader.End>
        )}
      </PageHeader>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Agent sidebar ── */}
        <div className="w-60 border-r flex flex-col shrink-0">
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
                  const agentThread = chatStore.getThread(agent._id);
                  const msgCount = agentThread?.messages.filter(
                    (m: Message) => m.role !== 'error',
                  ).length ?? 0;
                  const isActive = agentId === agent._id;
                  const hasUnread = !isActive && chatStore.hasUnread(agent._id);
                  return (
                    <button
                      key={agent._id}
                      className={`w-full text-left rounded-md px-2.5 py-2 transition-colors hover:bg-accent ${
                        isActive ? 'bg-accent' : ''
                      }`}
                      onClick={() => navigate(`/mastra/chat/${agent._id}`)}
                    >
                      <div className="flex items-start gap-2">
                        <div className="relative shrink-0 mt-0.5">
                          <IconRobot className="size-4 text-muted-foreground" />
                          {hasUnread && (
                            <span className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-red-500" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-sm font-medium truncate leading-tight">{agent.name}</p>
                            {msgCount > 0 && (
                              <span className="text-xs text-muted-foreground shrink-0">{msgCount}</span>
                            )}
                          </div>
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
                {messages.length === 0 ? (
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
                    {chatLoading && <TypingIndicator />}
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
                  <Button
                    size="icon"
                    className="size-[38px] shrink-0"
                    onClick={handleSend}
                    disabled={!input.trim() || chatLoading}
                  >
                    <IconSend className="size-4" />
                  </Button>
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
