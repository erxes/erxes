/** @jest-environment jsdom */
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { ThreadTabs } from '../components/ThreadTabs';
import type { IUseAgentsThreadsResult } from '../hooks/useAgentsThreads';

jest.mock('erxes-ui', () => ({
  ...jest.requireActual('../../../../../libs/erxes-ui/src/components/button'),
  ...jest.requireActual('../../../../../libs/erxes-ui/src/components/tabs'),
  ...jest.requireActual('../../../../../libs/erxes-ui/src/components/skeleton'),
  ...jest.requireActual('../../../../../libs/erxes-ui/src/lib/utils'),
}));
jest.mock('erxes-ui/lib', () =>
  jest.requireActual('../../../../../libs/erxes-ui/src/lib/utils'),
);

const originalObserver = global.ResizeObserver;
beforeAll(() => {
  global.ResizeObserver = jest.fn(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
});
afterAll(() => {
  global.ResizeObserver = originalObserver;
});
const records = [
  { id: 'one', title: 'First report' },
  { id: 'two', title: 'Second report' },
  { id: 'three', title: 'Third report' },
];
const state: IUseAgentsThreadsResult = {
  threads: records,
  pinnedThreads: [],
  loading: false,
  error: undefined,
  loadingMore: false,
  hasMore: false,
  loadMore: jest.fn(),
  refetch: jest.fn(),
};
const setup = (
  overrides: Partial<React.ComponentProps<typeof ThreadTabs>> = {},
) => {
  const props = {
    threadsState: state,
    activeThreadId: 'two',
    onSelect: jest.fn(),
    onNew: jest.fn(),
    onDelete: jest.fn(async () => true),
    onDeleted: jest.fn(),
    ...overrides,
  };
  const result = render(<ThreadTabs {...props} />);
  return { ...result, props };
};
it('switches sessions and creates a new chat from the fixed plus control', () => {
  const { props } = setup();
  fireEvent.mouseDown(screen.getByRole('tab', { name: 'Third report' }), {
    button: 0,
    ctrlKey: false,
  });
  expect(props.onSelect).toHaveBeenCalledWith('three');
  fireEvent.click(screen.getByRole('button', { name: 'New chat' }));
  expect(props.onNew).toHaveBeenCalledTimes(1);
});
it('deletes with one click, without opening a confirmation or selecting the closing tab', async () => {
  const { props } = setup();
  fireEvent.click(screen.getByRole('button', { name: 'Close Second report' }));
  await waitFor(() =>
    expect(screen.queryByRole('tab', { name: 'Second report' })).toBeNull(),
  );
  expect(props.onDelete).toHaveBeenCalledWith('two');
  expect(props.onDeleted).toHaveBeenCalledWith('two', 'three');
  expect(props.onSelect).not.toHaveBeenCalled();
  expect(screen.queryByRole('dialog')).toBeNull();
});
it('keeps a failed deletion open and prevents duplicate mutation clicks', async () => {
  let finish!: (success: boolean) => void;
  const deletion = new Promise<boolean>((resolve) => {
    finish = resolve;
  });
  const { props } = setup({ onDelete: jest.fn(() => deletion) });
  const button = screen.getByRole('button', { name: 'Close Second report' });
  fireEvent.click(button);
  fireEvent.click(button);
  expect(props.onDelete).toHaveBeenCalledTimes(1);
  await act(async () => {
    finish(false);
  });
  expect(screen.getByRole('tab', { name: 'Second report' })).toBeTruthy();
  expect(props.onDeleted).not.toHaveBeenCalled();
});
it('keeps tab order stable when server results reorder or titles change', () => {
  const { props, rerender } = setup();
  rerender(
    <ThreadTabs
      {...props}
      threadsState={{
        ...state,
        threads: [
          { id: 'three', title: 'Updated title' },
          ...records.slice(0, 2),
          { id: 'four', title: 'Fourth report' },
        ],
      }}
    />,
  );
  expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
    'First report',
    'Second report',
    'Updated title',
    'Fourth report',
  ]);
});
it('shows the optimistic first turn immediately and supports keyboard deletion', async () => {
  const { props } = setup({ activeThreadId: 'new-id' });
  const tab = screen.getByRole('tab', { name: 'Untitled chat' });
  expect(tab.getAttribute('aria-selected')).toBe('true');
  fireEvent.keyDown(tab, { key: 'Delete' });
  await waitFor(() => expect(props.onDelete).toHaveBeenCalledWith('new-id'));
});
it('keeps the last empty tab usable and exposes paginated sessions', () => {
  const { props } = setup({
    activeThreadId: undefined,
    threadsState: { ...state, threads: [], hasMore: true },
  });
  expect(screen.getByRole('tab', { name: 'New chat' })).toBeTruthy();
  fireEvent.click(screen.getByRole('button', { name: 'More sessions' }));
  expect(props.threadsState.loadMore).toHaveBeenCalledTimes(1);
});

it('never selects an already deleted neighbor when adjacent closes finish together', async () => {
  const first = Promise.withResolvers<boolean>();
  const second = Promise.withResolvers<boolean>();
  const { props } = setup({
    onDelete: jest.fn((id: string) =>
      id === 'one' ? first.promise : second.promise,
    ),
  });
  fireEvent.click(screen.getByRole('button', { name: 'Close First report' }));
  fireEvent.click(screen.getByRole('button', { name: 'Close Second report' }));
  await act(async () => {
    first.resolve(true);
    second.resolve(true);
  });
  await waitFor(() =>
    expect(screen.getAllByRole('tab').map((tab) => tab.textContent)).toEqual([
      'Third report',
    ]),
  );
  expect(props.onDeleted).toHaveBeenLastCalledWith('two', 'three');
});
