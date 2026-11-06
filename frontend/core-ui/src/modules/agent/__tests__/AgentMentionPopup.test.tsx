/** @jest-environment jsdom */
import { act, fireEvent, render, screen } from '@testing-library/react';
import {
  createRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import {
  AgentMentionPopup,
  type IAgentMentionPopupHandle,
} from '../components/AgentMentionPopup';
import {
  useAgentMentionSearch,
  type IAgentMentionSearchResult,
} from '../hooks/useAgentMentionSearch';
import { initAgentI18n, readCommonLocale } from './support/agentI18n';

const i18n = initAgentI18n('en');
afterEach(async () => {
  await i18n.changeLanguage('en');
});

jest.mock('../hooks/useAgentMentionSearch', () => ({
  useAgentMentionSearch: jest.fn(),
}));
jest.mock('erxes-ui', () => {
  const Pass = ({ children }: { children?: ReactNode }) => <>{children}</>;
  return {
    cn: (...classes: unknown[]) => classes.filter(Boolean).join(' '),
    readImage: (url: string) => url,
    Popover: Object.assign(Pass, {
      Anchor: Pass,
      Content: ({ children }: { children?: ReactNode }) => (
        <div data-testid="popover">{children}</div>
      ),
    }),
    SuggestionMenu: ({
      children,
      ...props
    }: HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
    SuggestionMenuItem: ({
      isSelected,
      ...props
    }: HTMLAttributes<HTMLDivElement> & { isSelected: boolean }) => (
      <div data-selected={isSelected} {...props} />
    ),
  };
});

const search = jest.mocked(useAgentMentionSearch);
const ann = { type: 'customer', id: 'c1', label: 'Ann Lee' } as const;
const acme = { type: 'company', id: 'co_1', label: 'Acme' } as const;
const results = (
  overrides: Partial<IAgentMentionSearchResult> = {},
): IAgentMentionSearchResult => ({
  groups: [
    {
      type: 'customer',
      options: [{ mention: ann, description: 'ann@example.com' }],
    },
    { type: 'company', options: [{ mention: acme }] },
  ],
  loading: false,
  failed: false,
  ...overrides,
});

const key = (ref: RefObject<IAgentMentionPopupHandle>, name: string) => {
  const event = {
    key: name,
    shiftKey: false,
    metaKey: false,
    ctrlKey: false,
    altKey: false,
    nativeEvent: { isComposing: false },
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
  } as unknown as KeyboardEvent<HTMLTextAreaElement>;
  let handled = false;
  act(() => {
    handled = ref.current?.handleKeyDown(event) ?? false;
  });
  return handled;
};

const renderPopup = (
  query = 'a',
  mentioned: ReadonlySet<string> = new Set(),
) => {
  const ref = createRef<IAgentMentionPopupHandle>();
  const onPick = jest.fn();
  const onDismiss = jest.fn();
  const onActiveOptionChange = jest.fn();
  render(
    <AgentMentionPopup
      ref={ref}
      query={{ start: 0, query }}
      anchor={{ left: 0, top: 0, height: 20 }}
      listboxId="mentions"
      mentioned={mentioned}
      containerRef={createRef<HTMLElement>()}
      onPick={onPick}
      onDismiss={onDismiss}
      onActiveOptionChange={onActiveOptionChange}
    />,
  );
  return { ref, onPick, onDismiss, onActiveOptionChange };
};

beforeEach(() => search.mockReturnValue(results()));

it('groups results by type and navigates them from the textarea', () => {
  const { ref, onPick, onActiveOptionChange } = renderPopup();
  expect(screen.getByRole('group', { name: 'Customers' })).toBeTruthy();
  expect(screen.getByRole('group', { name: 'Companies' })).toBeTruthy();
  const options = screen.getAllByRole('option');
  expect(options.map((option) => option.textContent)).toEqual([
    'A@Ann Leeann@example.com',
    'A@Acme',
  ]);
  expect(options[0].getAttribute('aria-selected')).toBe('true');
  expect(onActiveOptionChange).toHaveBeenLastCalledWith('mentions-customer-c1');
  expect(key(ref, 'ArrowDown')).toBe(true);
  expect(key(ref, 'ArrowDown')).toBe(true);
  expect(key(ref, 'ArrowUp')).toBe(true);
  expect(key(ref, 'Enter')).toBe(true);
  expect(onPick).toHaveBeenCalledWith(acme);
});

it('picks with the pointer and dismisses with Escape', () => {
  const { ref, onPick, onDismiss } = renderPopup();
  fireEvent.click(screen.getAllByRole('option')[0]);
  expect(onPick).toHaveBeenCalledWith(ann);
  expect(key(ref, 'Escape')).toBe(true);
  expect(onDismiss).toHaveBeenCalled();
});

it('shows loading, empty, failed and hint states', () => {
  search.mockReturnValue(results({ groups: [], loading: true }));
  const loading = renderPopup('ann');
  expect(screen.getByRole('listbox').textContent).toContain('Searching…');
  // A half-typed mention never sends while its results load.
  expect(key(loading.ref, 'Enter')).toBe(true);
});

it.each([
  [{ groups: [] }, 'ann', 'No results found'],
  [{ groups: [], failed: true }, 'ann', 'Search is unavailable. Try again.'],
  [{}, '', 'Type to search team members, contacts and records'],
])('renders the %o state', (override, query, text) => {
  search.mockReturnValue(results(override));
  const { ref } = renderPopup(query);
  expect(screen.getByRole('listbox').textContent).toContain(text);
  if (!results(override).groups.length) expect(key(ref, 'Enter')).toBe(false);
});

it('keeps already mentioned records pickable at the per-message limit', () => {
  const mentioned = new Set([
    'customer:c1',
    ...Array.from({ length: 9 }, (_, index) => `user:u${index}`),
  ]);
  const { ref, onPick } = renderPopup('a', mentioned);
  const options = screen.getAllByRole('option');
  expect(options[1].getAttribute('aria-disabled')).toBe('true');
  fireEvent.click(options[1]);
  expect(onPick).not.toHaveBeenCalled();
  expect(key(ref, 'Enter')).toBe(true);
  expect(onPick).toHaveBeenCalledWith(ann);
});

it('announces suggestions and labels groups in Mongolian', async () => {
  const mn = readCommonLocale('mn').agent;
  const groups = mn['mention-groups'] as Record<string, string>;
  await act(async () => {
    await i18n.changeLanguage('mn');
  });
  renderPopup('a');
  expect(screen.getByRole('group', { name: groups.customer })).toBeTruthy();
  expect(
    screen.getByRole('listbox', { name: String(mn['mention-menu']) }),
  ).toBeTruthy();
  expect(screen.getByRole('status').textContent).toBe(
    i18n.t('agent.mention-suggestions', { count: 2 }),
  );
  expect(screen.getByRole('status').textContent).not.toMatch(/suggestion/);
});
