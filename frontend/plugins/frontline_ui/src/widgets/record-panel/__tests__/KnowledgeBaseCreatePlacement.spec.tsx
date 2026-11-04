import { act, fireEvent, render, screen } from '@testing-library/react';
import { atom, createStore, Provider, useAtomValue, useStore } from 'jotai';
import { useForm } from 'react-hook-form';
import {
  MemoryRouter,
  useLocation,
  useNavigate,
  useSearchParams,
} from 'react-router-dom';
import { currentUserState, sidePanelDraftState } from 'ui-modules';
import { useKbPanelFormDraft } from '@/knowledgebase/shared/hooks/useKbPanelFormDraft';
import { KnowledgeBaseRecordPanel } from '../KnowledgeBaseRecordPanel';

const mockSave = jest.fn<Promise<string | null>, [string | undefined]>();
const mockDrafts = atom({});

jest.mock('react-router-dom', () => {
  Object.defineProperty(global, 'TextEncoder', {
    configurable: true,
    value: jest.requireActual<typeof import('util')>('util').TextEncoder,
  });
  return jest.requireActual<typeof import('react-router-dom')>(
    'react-router-dom',
  );
});

jest.mock('ui-modules', () => {
  const { atom, useAtomValue } =
    jest.requireActual<typeof import('jotai')>('jotai');
  const draft = atom<{
    contentType: string;
    defaults: Record<string, unknown>;
  } | null>(null);
  return {
    currentUserState: atom<{ _id: string } | null>({ _id: 'user-1' }),
    sidePanelDraftState: draft,
    useSidePanelDraft: (contentType: string) => {
      const current = useAtomValue(draft);
      return current?.contentType === contentType ? current.defaults : {};
    },
    useSidePanel: () => ({ close: jest.fn() }),
  };
});
jest.mock('erxes-ui', () => ({
  isDeeplyEqual: jest.requireActual<typeof import('deep-equal')>('deep-equal'),
  useConfirm: () => ({ confirm: () => Promise.resolve() }),
}));
jest.mock('react-i18next', () => ({ useTranslation: () => ({ t: () => '' }) }));
jest.mock('@apollo/client', () => ({ useQuery: () => ({}) }));
jest.mock('@/knowledgebase/articles/hooks/useArticles', () => ({
  useArticleDetail: () => ({}),
}));
jest.mock('@/knowledgebase/articles/hooks/useArticleMutations', () => ({}));
jest.mock(
  '@/knowledgebase/categories/hooks/useConfirmRemoveCategory',
  () => ({}),
);
jest.mock('@/knowledgebase/shared/hooks/useTopicDetail', () => ({}));
jest.mock(
  '@/knowledgebase/shared/components/TopicEmbedScriptDialog',
  () => ({}),
);
jest.mock('@/knowledgebase/graphql/queries', () => ({ CATEGORY_DETAIL: {} }));
jest.mock('@/knowledgebase/topics/components/TopicDrawer', () => ({
  TopicDrawer: () => <div>Topic</div>,
}));
jest.mock('@/knowledgebase/articles/components/ArticleDrawer', () => ({
  ArticleDrawer: (props: { topicId: string; categoryId: string }) => (
    <MockEditor {...props} kind="article" />
  ),
}));
jest.mock('@/knowledgebase/categories/components/CategoryDrawer', () => ({
  CategoryDrawer: (props: { topicId: string }) => (
    <MockEditor {...props} kind="category" />
  ),
}));

function MockEditor({
  topicId,
  categoryId = '',
  kind,
}: {
  topicId: string;
  categoryId?: string;
  kind: 'article' | 'category';
}) {
  const values = { title: '', content: '', topicId, categoryId };
  const form = useForm({ defaultValues: values });
  const draft = useKbPanelFormDraft({
    form,
    kind,
    context: kind === 'article' ? [topicId, categoryId] : [topicId],
    draftsState: mockDrafts,
    values,
    discardMessage: 'Discard?',
  });
  return (
    <div>
      <output>{`${kind}:${topicId}:${categoryId}`}</output>
      <input aria-label="Title" {...form.register('title')} />
      <textarea aria-label="Content" {...form.register('content')} />
      <button disabled={draft.saving} onClick={() => draft.save(mockSave)}>
        Save
      </button>
      <button onClick={draft.clearDraft}>Discard</button>
    </div>
  );
}

function Panel({ remount }: { remount: boolean }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [, setSearchParams] = useSearchParams();
  const contentType = new URLSearchParams(location.search).get('type');
  useAtomValue(currentUserState);
  return (
    <>
      <button onClick={() => navigate(-1)}>Back</button>
      <button onClick={() => navigate(1)}>Forward</button>
      <button
        onClick={() =>
          setSearchParams((previous) => {
            const next = new URLSearchParams(previous);
            next.set('status', 'draft');
            return next;
          })
        }
      >
        Filter
      </button>
      {contentType?.startsWith('frontline:') && (
        <KnowledgeBaseRecordPanel
          key={remount ? location.key : undefined}
          contentType={contentType}
          contentId="new"
          view="new"
        />
      )}
      <Navigate />
    </>
  );
}
let open: (type: string, topicId?: string, categoryId?: string) => void;
function Navigate() {
  const navigate = useNavigate();
  const store = useStore();
  open = (type, topicId = '', categoryId = '') => {
    store.set(sidePanelDraftState, {
      contentType: type,
      defaults: { topicId, categoryId },
    });
    navigate(`/?type=${type}`);
  };
  return null;
}

const setup = (remount = true) => {
  const store = createStore();
  render(
    <Provider store={store}>
      <MemoryRouter>
        <Panel remount={remount} />
      </MemoryRouter>
    </Provider>,
  );
  return store;
};

beforeEach(() => {
  mockSave.mockReset().mockResolvedValue('created-1');
});

it.each([
  ['article', 'category'],
  ['article', 'topic'],
  ['article', 'other:ticket'],
  ['category', 'article'],
  ['category', 'topic'],
  ['category', 'other:ticket'],
])(
  'restores %s placement and edits after %s overwrites global defaults',
  async (kind, other) => {
    setup();
    await act(() => {
      open(`frontline:${kind}`, 'topic-1', 'category-1');
      return Promise.resolve();
    });
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Retained' },
    });
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: 'Body' },
    });
    await act(() => {
      open(
        other.includes(':') ? other : `frontline:${other}`,
        'topic-2',
        'category-2',
      );
      return Promise.resolve();
    });
    fireEvent.click(screen.getByText('Back'));
    expect(
      screen.getByText(
        `${kind}:topic-1:${kind === 'article' ? 'category-1' : ''}`,
      ),
    ).toBeTruthy();
    expect(screen.getByLabelText<HTMLInputElement>('Title').value).toBe(
      'Retained',
    );
    expect(screen.getByLabelText<HTMLTextAreaElement>('Content').value).toBe(
      'Body',
    );
  },
);

it.each([
  ['article', false],
  ['article', true],
  ['category', false],
  ['category', true],
] as const)(
  'keeps separate %s history placements and scoped discard (remount %s)',
  async (kind, remount) => {
    setup(remount);
    await act(() => {
      open(`frontline:${kind}`, 'topic-1', 'category-1');
      return Promise.resolve();
    });
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'First' },
    });
    await act(() => {
      open(`frontline:${kind}`, 'topic-2', 'category-2');
      return Promise.resolve();
    });
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Second' },
    });
    fireEvent.click(screen.getByText('Back'));
    expect(
      screen.getByText(
        `${kind}:topic-1:${kind === 'article' ? 'category-1' : ''}`,
      ),
    ).toBeTruthy();
    expect(screen.getByLabelText<HTMLInputElement>('Title').value).toBe(
      'First',
    );
    fireEvent.click(screen.getByText('Discard'));
    fireEvent.click(screen.getByText('Forward'));
    expect(screen.getByLabelText<HTMLInputElement>('Title').value).toBe(
      'Second',
    );
    fireEvent.click(screen.getByText('Back'));
    expect(screen.getByLabelText<HTMLInputElement>('Title').value).toBe('');
  },
);

it.each(['article', 'category'])(
  'restores pending and confirmed %s create ownership without creating again',
  async (kind) => {
    setup();
    let finish: (id: string) => void = () => undefined;
    mockSave.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    await act(() => {
      open(`frontline:${kind}`, 'topic-1', 'category-1');
      return Promise.resolve();
    });
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Creating' },
    });
    fireEvent.click(screen.getByText('Save'));
    await act(() => {
      open('frontline:topic');
      return Promise.resolve();
    });
    fireEvent.click(screen.getByText('Back'));
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Save' }).disabled,
    ).toBe(true);
    fireEvent.click(screen.getByText('Save'));
    expect(mockSave).toHaveBeenCalledTimes(1);
    await act(() => {
      finish('created-1');
      return Promise.resolve();
    });
    await act(() => {
      open('other:ticket');
      return Promise.resolve();
    });
    fireEvent.click(screen.getByText('Back'));
    await act(() => {
      fireEvent.click(screen.getByText('Save'));
      return Promise.resolve();
    });
    expect(mockSave).toHaveBeenLastCalledWith('created-1');
  },
);

it('does not expose another user’s accepted placement or values through history', async () => {
  const store = setup();
  await act(() => {
    open('frontline:article', 'topic-1', 'category-1');
    return Promise.resolve();
  });
  fireEvent.change(screen.getByLabelText('Title'), {
    target: { value: 'Private' },
  });
  await act(() => {
    open('other:ticket');
    return Promise.resolve();
  });
  await act(() => {
    store.set(currentUserState, { _id: 'user-2', isOnboarded: true });
    return Promise.resolve();
  });
  fireEvent.click(screen.getByText('Back'));
  expect(screen.getByText('article::')).toBeTruthy();
  expect(screen.getByLabelText<HTMLInputElement>('Title').value).toBe('');
});

it('rejects stale same-type public defaults after a user change and accepts a fresh request', async () => {
  const store = setup();
  await act(() => {
    open('frontline:article', 'private-topic', 'private-category');
    return Promise.resolve();
  });
  fireEvent.change(screen.getByLabelText('Title'), {
    target: { value: 'Private' },
  });
  await act(() => {
    store.set(currentUserState, { _id: 'user-2', isOnboarded: true });
    return Promise.resolve();
  });
  expect(screen.getByText('article::')).toBeTruthy();
  expect(screen.getByLabelText<HTMLInputElement>('Title').value).toBe('');
  await act(() => {
    store.set(sidePanelDraftState, {
      contentType: 'frontline:article',
      defaults: { topicId: 'public-topic', categoryId: 'public-category' },
    });
    return Promise.resolve();
  });
  expect(screen.getByText('article:public-topic:public-category')).toBeTruthy();
});

it.each([
  ['article', 'category', false],
  ['article', 'category', true],
  ['article', 'article', false],
  ['article', 'article', true],
  ['category', 'article', false],
  ['category', 'article', true],
  ['category', 'category', false],
  ['category', 'category', true],
] as const)(
  'retains %s context after %s Create, Back and a filter navigation (remount %s)',
  async (kind, otherKind, remount) => {
    setup(remount);
    let finish: (id: string) => void = () => undefined;
    mockSave.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    await act(() => {
      open(`frontline:${kind}`, 'topic-1', 'category-1');
      return Promise.resolve();
    });
    fireEvent.change(screen.getByLabelText('Title'), {
      target: { value: 'Retained' },
    });
    fireEvent.change(screen.getByLabelText('Content'), {
      target: { value: 'Body' },
    });
    fireEvent.click(screen.getByText('Save'));
    await act(() => {
      open(`frontline:${otherKind}`, 'topic-2', 'category-2');
      return Promise.resolve();
    });
    fireEvent.click(screen.getByText('Back'));
    fireEvent.click(screen.getByText('Filter'));
    expect(
      screen.getByText(
        `${kind}:topic-1:${kind === 'article' ? 'category-1' : ''}`,
      ),
    ).toBeTruthy();
    expect(screen.getByLabelText<HTMLInputElement>('Title').value).toBe(
      'Retained',
    );
    expect(screen.getByLabelText<HTMLTextAreaElement>('Content').value).toBe(
      'Body',
    );
    expect(
      screen.getByRole<HTMLButtonElement>('button', { name: 'Save' }).disabled,
    ).toBe(true);
    fireEvent.click(screen.getByText('Save'));
    expect(mockSave).toHaveBeenCalledTimes(1);
    await act(() => {
      finish('created-1');
      return Promise.resolve();
    });
    fireEvent.click(screen.getByText('Back'));
    await act(() => {
      fireEvent.click(screen.getByText('Save'));
      return Promise.resolve();
    });
    expect(mockSave).toHaveBeenLastCalledWith('created-1');
  },
);
