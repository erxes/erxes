import { Button, Input, Separator, cn } from 'erxes-ui';
import {
  IconBook,
  IconChevronRight,
  IconDeviceMobileMessage,
  IconMessageDots,
  IconSend,
  IconSparkles,
  IconWorld,
} from '@tabler/icons-react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  currentOrganizationState,
  currentUserState,
  useVersion,
} from 'ui-modules';
import { useEffect, useRef, useState } from 'react';

import { AppPath } from '@/types/paths/AppPath';
import { useAtomValue } from 'jotai';

interface ChatMessage {
  id: number;
  role: 'assistant' | 'user';
  text: string;
}

const SUGGESTIONS: {
  icon: typeof IconBook;
  label: string;
  to?: string;
  keywords?: string[];
}[] = [
  {
    icon: IconBook,
    label: 'Create a Help Center',
    to: '/frontline/helpcenter',
    keywords: ['help', 'center', 'knowledge', 'faq', 'docs'],
  },
  {
    icon: IconWorld,
    label: 'Add Messenger to my website',
    to: '/settings/frontline/channels',
    keywords: ['messenger', 'widget', 'website'],
  },
  {
    icon: IconDeviceMobileMessage,
    label: 'Set up in-app messaging',
    to: '/settings/frontline/channels',
    keywords: ['app', 'in-app', 'chat', 'message'],
  },
  {
    icon: IconMessageDots,
    label: 'Something else',
    keywords: [],
  },
];

const EXTRA_LINKS = [
  {
    label: 'team settings',
    to: '/settings/team-member',
    keywords: ['team', 'invite', 'member'],
  },
  { label: 'your inbox', to: '/my-inbox', keywords: ['inbox', 'notification'] },
  { label: 'settings', to: '/settings', keywords: ['setting', 'config'] },
];

const matchDestination = (text: string) => {
  const lower = text.toLowerCase();
  return [...SUGGESTIONS, ...EXTRA_LINKS].find((link) =>
    link.keywords?.some((keyword) => lower.includes(keyword)),
  );
};

export const WelcomeHome = () => {
  const navigate = useNavigate();
  const currentUser = useAtomValue(currentUserState);
  const organization = useAtomValue(currentOrganizationState);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const [input, setInput] = useState('');

  const firstName = currentUser?.details?.firstName || 'there';
  const orgName = organization?.name || 'erxes';
  const isSaas = useVersion('saas');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 0,
      role: 'assistant',
      text: `Hi ${firstName}. What would you like your team to do first?`,
    },
  ]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (organization && isSaas) {
    return <Navigate to={AppPath.Index} replace />;
  }

  const send = () => {
    const text = input.trim();
    if (!text) {
      return;
    }
    const destination = matchDestination(text);
    setMessages((prev) => [
      ...prev,
      { id: prev.length, role: 'user', text },
      {
        id: prev.length + 1,
        role: 'assistant',
        text: destination?.to
          ? `Sure — taking you to ${destination.label}.`
          : 'Got it. I can point you to a Help Center, Messenger setup, team invites, or settings — try one of the quick actions below.',
      },
    ]);
    setInput('');
    if (destination?.to) {
      navigate(destination.to);
    }
  };

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <div className="flex h-13 w-full shrink-0 flex-col bg-sidebar">
        <div className="flex flex-auto items-center gap-2 px-3">
          <Button variant="ghost" className="font-semibold" tabIndex={-1}>
            <IconSparkles className="size-4 text-accent-foreground" />
            Welcome
          </Button>
        </div>
      </div>
      <Separator className="w-auto flex-none" />

      <div className="flex flex-1 flex-col items-center overflow-y-auto px-4 py-10">
        <div className="flex w-full max-w-2xl flex-col gap-8">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Welcome to {orgName}
            </h1>
            <p className="text-sm text-muted-foreground">
              Tell us what you want to achieve. Our assistant and setup team
              will help you get started.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {messages.map((message) =>
              message.role === 'assistant' ? (
                <div key={message.id} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <IconSparkles className="size-4" />
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      erxes assistant
                    </span>
                    <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold text-primary">
                      AI
                    </span>
                  </div>
                  <p className="ml-9 w-fit rounded-xl bg-muted px-4 py-2.5 text-sm text-foreground">
                    {message.text}
                  </p>
                </div>
              ) : (
                <p
                  key={message.id}
                  className="w-fit self-end rounded-xl bg-primary px-4 py-2.5 text-sm text-primary-foreground"
                >
                  {message.text}
                </p>
              ),
            )}
            <div ref={endRef} />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {SUGGESTIONS.map(({ icon: Icon, label, to }) => (
              <button
                key={label}
                type="button"
                onClick={() => (to ? navigate(to) : inputRef.current?.focus())}
                className={cn(
                  'flex items-center gap-3 rounded-xl border bg-background px-4 py-3.5 text-left text-sm font-medium transition-colors',
                  'hover:border-primary/40 hover:bg-muted/50',
                )}
              >
                <Icon className="size-5 shrink-0 text-primary" />
                <span className="flex-1">{label}</span>
                <IconChevronRight className="size-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 px-4 pb-6">
        <form
          className="flex w-full max-w-2xl items-center gap-2 rounded-full border bg-background px-2 py-1.5 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell us what you need..."
            className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
          />
          <Button
            type="submit"
            size="icon"
            className="size-9 shrink-0 rounded-full"
            disabled={!input.trim()}
          >
            <IconSend className="size-4" />
          </Button>
        </form>
        <p className="text-xs text-muted-foreground">
          An erxes team member can join when needed.
        </p>
      </div>
    </div>
  );
};
