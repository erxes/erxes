/** @jest-environment jsdom */
import { render, screen } from '@testing-library/react';
import type { UIMessage } from 'ai';
import type { ReactNode } from 'react';
import { MessageList, type IMessageListProps } from '../components/MessageList';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (
      key: string,
      options?: string | { defaultValue?: string; count?: number },
    ) =>
      typeof options === 'string'
        ? options
        : (options?.defaultValue ?? key).replace(
            '{{count}}',
            String(options?.count ?? ''),
          ),
  }),
}));

jest.mock('ai', () => ({
  isTextUIPart: (part: { type: string }) => part.type === 'text',
  isToolUIPart: (part: { type: string }) =>
    part.type === 'dynamic-tool' || part.type.startsWith('tool-'),
}));
jest.mock('erxes-ui', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const Wrapper = ({ children }: { children?: ReactNode }) => (
    <div>{children}</div>
  );
  const compound = Object.assign(Wrapper, {
    Provider: Wrapper,
    Trigger: Wrapper,
    Content: Wrapper,
  });
  return {
    Button: ({ children, ...props }: { children?: ReactNode }) => (
      <button {...props}>{children}</button>
    ),
    Skeleton: Wrapper,
    Tooltip: compound,
    Collapsible: compound,
    ScrollArea: {
      Root: Wrapper,
      Viewport: React.forwardRef<HTMLDivElement, { children?: ReactNode }>(
        ({ children }, ref) => <div ref={ref}>{children}</div>,
      ),
      Bar: () => null,
    },
    cn: (...values: unknown[]) => values.filter(Boolean).join(' '),
  };
});
jest.mock('../artifacts/ArtifactCard', () => ({
  ArtifactCard: () => <div>File card</div>,
}));
jest.mock('../components/BotBadge', () => ({
  BotBadge: () => <span data-testid="bloub" />,
}));
jest.mock('../components/UserMessage', () => ({
  UserMessage: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
jest.mock('../components/MessagePart', () => {
  const { ArtifactToolResult } = jest.requireActual(
    '../artifacts/ArtifactToolResult',
  );
  return {
    readMessageAskUserAnswerCard: () => null,
    hasVisibleParts: (parts: UIMessage['parts']) => parts.length > 0,
    MessagePartRenderer: ({ part }: { part: UIMessage['parts'][number] }) =>
      part.type === 'text' ? (
        <p>{part.text}</p>
      ) : part.type === 'dynamic-tool' && part.toolName === 'createArtifact' ? (
        <ArtifactToolResult tool={part} isStreaming />
      ) : null,
  };
});

const resizeObserver = global.ResizeObserver;
beforeAll(() => {
  global.ResizeObserver = jest.fn(() => ({
    observe: jest.fn(),
    disconnect: jest.fn(),
    unobserve: jest.fn(),
  }));
});
afterAll(() => {
  global.ResizeObserver = resizeObserver;
});

const props: Omit<IMessageListProps, 'messages' | 'status'> = {
  loadingThread: false,
  approvalBusy: false,
  onApprovalRespond: jest.fn(),
  answerBusy: false,
  onAnswer: jest.fn(),
  onRetryTurn: jest.fn(),
  onEditMessage: jest.fn(),
  editingDisabled: true,
  error: undefined,
};
const user: UIMessage = {
  id: 'user',
  role: 'user',
  parts: [{ type: 'text', text: 'Create a report' }],
};
const assistant = (parts: UIMessage['parts']): UIMessage => ({
  id: 'assistant',
  role: 'assistant',
  parts,
});
const query: UIMessage['parts'][number] = {
  type: 'dynamic-tool',
  toolName: 'callGraphql',
  toolCallId: 'query',
  state: 'input-available',
  input: { query: '{ deals { _id } }' },
};

it('replaces the pending header with one writing header during submitted and streaming transitions', () => {
  const { rerender } = render(
    <MessageList {...props} status="submitted" messages={[user]} />,
  );
  expect(screen.getAllByRole('status')).toHaveLength(1);
  expect(screen.getByRole('status').textContent).toBe('Working…');
  for (const status of ['submitted', 'streaming']) {
    rerender(
      <MessageList
        {...props}
        status={status}
        messages={[user, assistant([{ type: 'text', text: 'Report reply' }])]}
      />,
    );
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.getAllByText('Writing…')).toHaveLength(1);
    expect(screen.queryByText('AI Agent')).toBeNull();
    expect(screen.getAllByTestId('bloub')).toHaveLength(1);
  }
  rerender(
    <MessageList
      {...props}
      status="ready"
      messages={[user, assistant([{ type: 'text', text: 'Report reply' }])]}
    />,
  );
  expect(screen.queryByRole('status')).toBeNull();
  expect(screen.queryByText('AI Agent')).toBeNull();
  expect(screen.getByText('Report reply')).toBeTruthy();
});

it('uses current tool activity beside Bloub while multiple step groups stay static', () => {
  render(
    <MessageList
      {...props}
      status="streaming"
      messages={[
        user,
        assistant([
          { type: 'reasoning', text: 'Plan' },
          { type: 'text', text: 'I will check the data.' },
          query,
        ]),
      ]}
    />,
  );
  expect(screen.getAllByRole('status')).toHaveLength(1);
  expect(screen.getByRole('status').textContent).toBe('Querying deals');
  expect(screen.queryByText('Working…')).toBeNull();
  expect(screen.queryByText('Writing…')).toBeNull();
  expect(screen.getAllByTestId('bloub')).toHaveLength(1);
});

it('keeps one live header when a hidden answer turn follows the assistant row', () => {
  const answer: UIMessage = {
    id: 'answer',
    role: 'user',
    metadata: { agentsAnswer: true },
    parts: [{ type: 'text', text: 'Last month' }],
  };
  render(
    <MessageList
      {...props}
      status="submitted"
      messages={[user, assistant([query]), answer]}
    />,
  );
  expect(screen.getAllByRole('status')).toHaveLength(1);
  expect(screen.getByRole('status').textContent).toBe('Querying deals');
  expect(screen.getAllByTestId('bloub')).toHaveLength(1);
});

it('does not repeat file generation progress in the body', () => {
  render(
    <MessageList
      {...props}
      status="streaming"
      messages={[
        user,
        assistant([
          {
            type: 'dynamic-tool',
            toolName: 'createArtifact',
            toolCallId: 'file',
            state: 'input-streaming',
            input: { type: 'html', title: 'Sales' },
          },
        ]),
      ]}
    />,
  );
  expect(screen.getAllByRole('status')).toHaveLength(1);
  expect(screen.getByRole('status').textContent).toBe('Creating file…');
  expect(screen.queryByText('Creating your file…')).toBeNull();
});

it('keeps a single pending header if streaming starts before an assistant message exists', () => {
  render(<MessageList {...props} status="streaming" messages={[user]} />);
  expect(screen.getAllByRole('status')).toHaveLength(1);
  expect(screen.getByRole('status').textContent).toBe('Working…');
});

it('shows only the latest response avatar across earlier replies, pending, streaming and settled turns', () => {
  const history: UIMessage[] = [
    { ...user, id: 'u1' },
    { ...assistant([{ type: 'text', text: 'Earlier reply' }]), id: 'a1' },
    { ...user, id: 'u2' },
    { ...assistant([{ type: 'text', text: 'Previous reply' }]), id: 'a2' },
  ];
  const { rerender } = render(
    <MessageList {...props} status="ready" messages={history} />,
  );
  expect(screen.getAllByTestId('bloub')).toHaveLength(1);
  const nextUser = { ...user, id: 'u3' };
  rerender(
    <MessageList
      {...props}
      status="submitted"
      messages={[...history, nextUser]}
    />,
  );
  expect(screen.getAllByTestId('bloub')).toHaveLength(1);
  expect(screen.getByRole('status').textContent).toBe('Working…');
  const messages = [
    ...history,
    nextUser,
    {
      ...assistant([{ type: 'text' as const, text: 'Latest reply' }]),
      id: 'a3',
    },
  ];
  rerender(<MessageList {...props} status="streaming" messages={messages} />);
  expect(screen.getAllByTestId('bloub')).toHaveLength(1);
  expect(screen.getByRole('status').textContent).toBe('Writing…');
  rerender(<MessageList {...props} status="ready" messages={messages} />);
  expect(screen.getAllByTestId('bloub')).toHaveLength(1);
  expect(screen.queryByRole('status')).toBeNull();
  expect(screen.getByText('Earlier reply')).toBeTruthy();
  expect(screen.getByText('Previous reply')).toBeTruthy();
  expect(screen.getByText('Latest reply')).toBeTruthy();
});
