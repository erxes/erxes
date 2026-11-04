import {
  useState,
  type InputHTMLAttributes,
  type PropsWithChildren,
} from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { currentUserState } from 'ui-modules';
import { ArticleDrawer } from '../ArticleDrawer';
import type { IArticleDetail } from '@/knowledgebase/types';
import { deserialize, serialize } from 'v8';

globalThis.structuredClone = (value) => deserialize(serialize(value));

const mockEdit = jest.fn();
const mockQuery = jest.fn();
const mockUploads: Array<(url: string) => void> = [];
jest.mock('@apollo/client', () => ({
  useApolloClient: () => ({ query: mockQuery }),
  useMutation: () => [mockEdit, { loading: false }],
}));
jest.mock('@/knowledgebase/graphql/mutations', () => ({
  ADD_ARTICLE: 'add',
  EDIT_ARTICLE: 'edit',
}));
jest.mock('@/knowledgebase/graphql/queries', () => ({
  ARTICLE_DETAIL: 'detail',
}));
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string) =>
      typeof fallback === 'string' ? fallback : key,
  }),
}));
jest.mock('ui-modules', () => ({
  currentUserState: jest
    .requireActual<typeof import('jotai')>('jotai')
    .atom({ _id: 'user-1' }),
}));
jest.mock('@/knowledgebase/articles/hooks/useArticles', () => ({
  useArticleDetail: () => ({}),
}));
jest.mock('@/knowledgebase/shared/hooks/useKbCloseRemovedRecord', () => ({
  useKbCloseRemovedRecord: () => jest.fn(),
}));
jest.mock('@/knowledgebase/shared/hooks/useKbToast', () => ({
  useKbToast: () => ({
    run: async (action: () => Promise<unknown>) => {
      await action();
      return true;
    },
  }),
}));
jest.mock('@/knowledgebase/shared/components/KbFormSheet', () => ({
  KbFormSheet: ({
    children,
    onSubmit,
    onClose,
  }: PropsWithChildren<{ onSubmit: () => void; onClose: () => void }>) => (
    <div>
      {children}
      <button onClick={onSubmit}>Save</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  ),
}));
jest.mock('@/knowledgebase/shared/components/KbFormLayout', () => {
  const Box = ({ children }: PropsWithChildren) => <div>{children}</div>;
  return {
    KbFormItem: Box,
    KbFormSection: Object.assign(Box, { Content: Box }),
    KbFormPanelContext: jest
      .requireActual<typeof import('react')>('react')
      .createContext(false),
  };
});
jest.mock('@/knowledgebase/shared/components/SelectKbCategory', () => ({
  SelectKbCategory: () => null,
}));
jest.mock('@/knowledgebase/shared/components/SelectKbTopic', () => ({
  SelectKbTopic: () => null,
}));
jest.mock('@/knowledgebase/articles/components/ScheduleDateField', () => ({
  ScheduleDateField: () => null,
}));
jest.mock('erxes-ui', () => {
  const React = jest.requireActual<typeof import('react')>('react');
  const Box = ({ children }: PropsWithChildren) => <div>{children}</div>;
  const UploadContext = React.createContext<{
    onChange: (file: { url: string; name: string }) => void;
  } | null>(null);
  const UploadRoot = ({
    children,
    onChange,
  }: PropsWithChildren<{
    onChange: (file: { url: string; name: string }) => void;
  }>) => (
    <UploadContext.Provider value={{ onChange }}>
      {children}
    </UploadContext.Provider>
  );
  const UploadPreview = ({ onUploadStart }: { onUploadStart?: () => void }) => {
    const context = React.useContext(UploadContext);
    return (
      <button
        type="button"
        onClick={() => {
          onUploadStart?.();
          mockUploads.push((url) =>
            context?.onChange({ url, name: 'Uploaded.png' }),
          );
        }}
      >
        Start upload
      </button>
    );
  };
  const RemoveUpload = () => {
    const context = React.useContext(UploadContext);
    return (
      <button
        type="button"
        onClick={() => context?.onChange({ url: '', name: '' })}
      >
        Remove media
      </button>
    );
  };
  return {
    Form: Object.assign(Box, {
      Field:
        jest.requireActual<typeof import('react-hook-form')>('react-hook-form')
          .Controller,
      Control: Box,
      Message: () => null,
      Description: Box,
    }),
    Input: React.forwardRef<
      HTMLInputElement,
      InputHTMLAttributes<HTMLInputElement>
    >((props, ref) => <input {...props} ref={ref} />),
    Textarea: 'textarea',
    Button: 'button',
    cn: () => '',
    readImage: (url: string) => url,
    Editor: () => null,
    MultipleSelector: () => null,
    Switch: () => null,
    Select: Object.assign(Box, {
      Trigger: Box,
      Value: Box,
      Content: Box,
      Item: Box,
    }),
    Upload: {
      Root: UploadRoot,
      Preview: UploadPreview,
      Button: Box,
      RemoveButton: RemoveUpload,
    },
    isDefined: (value: unknown) => value !== null && value !== undefined,
    isDeeplyEqual:
      jest.requireActual<typeof import('deep-equal')>('deep-equal'),
    useConfirm: () => ({ confirm: () => new Promise<void>(() => undefined) }),
  };
});

const article: IArticleDetail = {
  _id: 'article-1',
  title: 'Original title',
  content: '<p>Body</p>',
  status: 'draft',
  categoryId: 'category-1',
  code: null,
  summary: null,
  isPrivate: false,
  reactionChoices: [],
  viewCount: 0,
  topicId: 'topic-1',
  createdDate: null,
  modifiedDate: null,
  scheduledDate: null,
  image: null,
  attachments: [],
  pdfAttachment: null,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUploads.length = 0;
});

it('saves a dirty title without reverting a concurrent inline status or summary', async () => {
  mockQuery.mockResolvedValue({
    data: {
      knowledgeBaseArticleDetail: {
        ...article,
        status: 'publish',
        summary: 'Inline update',
      },
    },
  });
  mockEdit.mockResolvedValue({});
  const panel = render(
    <Provider>
      <ArticleDrawer
        articleId="article-1"
        article={article}
        topicId="topic-1"
        categoryId="category-1"
        onClose={jest.fn()}
      />
    </Provider>,
  );
  fireEvent.change(screen.getByPlaceholderText('Enter article title'), {
    target: { value: 'Edited title' },
  });
  panel.rerender(
    <Provider>
      <ArticleDrawer
        articleId="article-1"
        article={{ ...article, status: 'publish', summary: 'Inline update' }}
        topicId="topic-1"
        categoryId="category-1"
        onClose={jest.fn()}
      />
    </Provider>,
  );
  await act(() => {
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    return Promise.resolve();
  });
  expect(mockEdit).toHaveBeenCalledWith({
    variables: {
      _id: 'article-1',
      doc: { title: 'Edited title', content: '<p>Body</p>', status: 'publish' },
    },
  });
});

it('does not include fields first edited while the current save is reading fresh data', async () => {
  let finishQuery: (value: {
    data: { knowledgeBaseArticleDetail: IArticleDetail };
  }) => void = () => undefined;
  mockQuery.mockImplementation(
    () =>
      new Promise((resolve) => {
        finishQuery = resolve;
      }),
  );
  mockEdit.mockResolvedValue({});
  render(
    <Provider>
      <ArticleDrawer
        articleId="article-1"
        article={article}
        topicId="topic-1"
        categoryId="category-1"
        onClose={jest.fn()}
      />
    </Provider>,
  );
  fireEvent.change(screen.getByPlaceholderText('Enter article title'), {
    target: { value: 'Submitted title' },
  });
  await act(() => {
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    return Promise.resolve();
  });
  fireEvent.change(screen.getByPlaceholderText('Enter article summary'), {
    target: { value: 'Newer summary' },
  });
  await act(() => {
    finishQuery({ data: { knowledgeBaseArticleDetail: article } });
    return Promise.resolve();
  });
  expect(mockEdit).toHaveBeenCalledWith({
    variables: {
      _id: 'article-1',
      doc: {
        title: 'Submitted title',
        content: '<p>Body</p>',
        status: 'draft',
      },
    },
  });
  expect(
    screen.getByPlaceholderText<HTMLTextAreaElement>('Enter article summary')
      .value,
  ).toBe('Newer summary');
});

it('saves an image whose upload completes while Activity has unmounted Details', async () => {
  mockQuery.mockResolvedValue({
    data: { knowledgeBaseArticleDetail: article },
  });
  mockEdit.mockResolvedValue({});
  const Panel = () => {
    const [activity, setActivity] = useState(false);
    return (
      <>
        <button onClick={() => setActivity(!activity)}>
          {activity ? 'Details' : 'Activity'}
        </button>
        {activity ? (
          <p>Activity empty state</p>
        ) : (
          <ArticleDrawer
            articleId="article-1"
            article={article}
            topicId="topic-1"
            categoryId="category-1"
            onClose={jest.fn()}
          />
        )}
      </>
    );
  };
  render(
    <Provider>
      <Panel />
    </Provider>,
  );
  fireEvent.click(screen.getAllByRole('button', { name: 'Start upload' })[0]);
  fireEvent.click(screen.getByRole('button', { name: 'Activity' }));
  act(() => mockUploads[0]('late-image.png'));
  fireEvent.click(screen.getByRole('button', { name: 'Details' }));
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  });
  expect(mockEdit).toHaveBeenCalledWith({
    variables: {
      _id: 'article-1',
      doc: {
        title: 'Original title',
        content: '<p>Body</p>',
        status: 'draft',
        image: { url: 'late-image.png', name: '' },
      },
    },
  });
});

it.each(['Cancel', 'logout'] as const)(
  'rejects a late image after %s even when the same user reopens',
  async (action) => {
    const store = createStore();
    const mount = () =>
      render(
        <Provider store={store}>
          <ArticleDrawer
            articleId="article-1"
            article={article}
            topicId="topic-1"
            categoryId="category-1"
            onClose={jest.fn()}
          />
        </Provider>,
      );
    const first = mount();
    fireEvent.click(screen.getAllByRole('button', { name: 'Start upload' })[0]);
    if (action === 'Cancel')
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    first.unmount();
    if (action === 'logout')
      act(() => {
        store.set(currentUserState, null);
        store.set(currentUserState, { _id: 'user-1', isOnboarded: true });
      });
    mockQuery.mockResolvedValue({
      data: { knowledgeBaseArticleDetail: article },
    });
    mockEdit.mockResolvedValue({});
    mount();
    act(() => mockUploads[0]('obsolete.png'));
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    });
    expect(mockEdit).toHaveBeenCalledWith({
      variables: {
        _id: 'article-1',
        doc: {
          title: 'Original title',
          content: '<p>Body</p>',
          status: 'draft',
        },
      },
    });
  },
);

it('merges overlapping uploads without resurrecting a removed attachment after Activity', async () => {
  const loaded = {
    ...article,
    attachments: [
      {
        url: 'removed.pdf',
        name: 'Removed.pdf',
        type: null,
        size: null,
        duration: null,
      },
    ],
  };
  mockQuery.mockResolvedValue({ data: { knowledgeBaseArticleDetail: loaded } });
  mockEdit.mockResolvedValue({});
  const Panel = () => {
    const [activity, setActivity] = useState(false);
    return (
      <>
        <button onClick={() => setActivity(!activity)}>
          {activity ? 'Details' : 'Activity'}
        </button>
        {!activity && (
          <ArticleDrawer
            articleId="article-1"
            article={loaded}
            topicId="topic-1"
            categoryId="category-1"
            onClose={jest.fn()}
          />
        )}
      </>
    );
  };
  render(
    <Provider>
      <Panel />
    </Provider>,
  );
  fireEvent.click(screen.getAllByRole('button', { name: 'Start upload' })[1]);
  fireEvent.click(screen.getByRole('button', { name: 'Activity' }));
  fireEvent.click(screen.getByRole('button', { name: 'Details' }));
  fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
  fireEvent.click(screen.getAllByRole('button', { name: 'Start upload' })[1]);
  act(() => mockUploads[1]('second.pdf'));
  act(() => mockUploads[0]('first.pdf'));
  act(() => mockUploads[0]('first.pdf'));
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  });
  expect(mockEdit).toHaveBeenCalledWith({
    variables: {
      _id: 'article-1',
      doc: {
        title: 'Original title',
        content: '<p>Body</p>',
        status: 'draft',
        attachments: [
          { url: 'second.pdf', name: '' },
          { url: 'first.pdf', name: '' },
        ],
      },
    },
  });
});

it('keeps separate completion writers for uploads started in the same mounted field', async () => {
  mockQuery.mockResolvedValue({
    data: { knowledgeBaseArticleDetail: article },
  });
  mockEdit.mockResolvedValue({});
  render(
    <Provider>
      <ArticleDrawer
        articleId="article-1"
        article={article}
        topicId="topic-1"
        categoryId="category-1"
        onClose={jest.fn()}
      />
    </Provider>,
  );
  fireEvent.click(screen.getAllByRole('button', { name: 'Start upload' })[1]);
  fireEvent.click(screen.getAllByRole('button', { name: 'Start upload' })[1]);
  act(() => mockUploads[1]('second.pdf'));
  act(() => mockUploads[0]('first.pdf'));
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  });
  expect(mockEdit).toHaveBeenCalledWith({
    variables: {
      _id: 'article-1',
      doc: {
        title: 'Original title',
        content: '<p>Body</p>',
        status: 'draft',
        attachments: [
          { url: 'second.pdf', name: '' },
          { url: 'first.pdf', name: '' },
        ],
      },
    },
  });
});

it('does not resurrect an image removed after its uploader remounts', async () => {
  const loaded = {
    ...article,
    image: {
      url: 'original.png',
      name: 'Original',
      type: null,
      size: null,
      duration: null,
    },
  };
  mockQuery.mockResolvedValue({ data: { knowledgeBaseArticleDetail: loaded } });
  mockEdit.mockResolvedValue({});
  const Panel = () => {
    const [activity, setActivity] = useState(false);
    return (
      <>
        <button onClick={() => setActivity(!activity)}>
          {activity ? 'Details' : 'Activity'}
        </button>
        {!activity && (
          <ArticleDrawer
            articleId="article-1"
            article={loaded}
            topicId="topic-1"
            categoryId="category-1"
            onClose={jest.fn()}
          />
        )}
      </>
    );
  };
  render(
    <Provider>
      <Panel />
    </Provider>,
  );
  fireEvent.click(screen.getAllByRole('button', { name: 'Start upload' })[0]);
  fireEvent.click(screen.getByRole('button', { name: 'Activity' }));
  fireEvent.click(screen.getByRole('button', { name: 'Details' }));
  fireEvent.click(screen.getAllByRole('button', { name: 'Remove media' })[0]);
  act(() => mockUploads[0]('obsolete.png'));
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  });
  expect(mockEdit).toHaveBeenCalledWith({
    variables: {
      _id: 'article-1',
      doc: {
        title: 'Original title',
        content: '<p>Body</p>',
        status: 'draft',
        image: null,
      },
    },
  });
});

it('keeps the latest selected image when the earlier upload completes last', async () => {
  mockQuery.mockResolvedValue({
    data: { knowledgeBaseArticleDetail: article },
  });
  mockEdit.mockResolvedValue({});
  render(
    <Provider>
      <ArticleDrawer
        articleId="article-1"
        article={article}
        topicId="topic-1"
        categoryId="category-1"
        onClose={jest.fn()}
      />
    </Provider>,
  );
  fireEvent.click(screen.getAllByRole('button', { name: 'Start upload' })[0]);
  fireEvent.click(screen.getAllByRole('button', { name: 'Start upload' })[0]);
  act(() => mockUploads[1]('latest.png'));
  act(() => mockUploads[0]('obsolete.png'));
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  });
  expect(mockEdit).toHaveBeenCalledWith({
    variables: {
      _id: 'article-1',
      doc: {
        title: 'Original title',
        content: '<p>Body</p>',
        status: 'draft',
        image: { url: 'latest.png', name: '' },
      },
    },
  });
});

it('keeps a confirmed article create and its pending upload when New is reopened', async () => {
  const store = createStore();
  mockEdit.mockResolvedValue({
    data: { knowledgeBaseArticlesAdd: { _id: 'created-article' } },
  });
  mockQuery.mockResolvedValue({
    data: {
      knowledgeBaseArticleDetail: {
        ...article,
        _id: 'created-article',
        title: 'Created article',
        content: '<p></p>',
      },
    },
  });
  const mount = () =>
    render(
      <Provider store={store}>
        <ArticleDrawer
          topicId="topic-1"
          categoryId="category-1"
          onClose={jest.fn()}
        />
      </Provider>,
    );
  const first = mount();
  fireEvent.change(screen.getByPlaceholderText('Enter article title'), {
    target: { value: 'Created article' },
  });
  fireEvent.click(screen.getAllByRole('button', { name: 'Start upload' })[0]);
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  });
  first.unmount();
  mount();
  expect(
    screen.getByPlaceholderText<HTMLInputElement>('Enter article title').value,
  ).toBe('Created article');
  act(() => mockUploads[0]('late-created-image.png'));
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Save' }));
  });
  expect(mockEdit).toHaveBeenCalledTimes(2);
  expect(mockEdit).toHaveBeenLastCalledWith({
    variables: {
      _id: 'created-article',
      doc: {
        title: 'Created article',
        content: '<p></p>',
        status: 'draft',
        image: { url: 'late-created-image.png', name: '' },
      },
    },
  });
});

it.each(['Cancel', 'logout'] as const)(
  'does not revive a discarded confirmed article create after %s',
  async (action) => {
    const store = createStore();
    mockEdit.mockResolvedValue({
      data: { knowledgeBaseArticlesAdd: { _id: 'created-article' } },
    });
    const mount = () =>
      render(
        <Provider store={store}>
          <ArticleDrawer
            topicId="topic-1"
            categoryId="category-1"
            onClose={jest.fn()}
          />
        </Provider>,
      );
    const first = mount();
    fireEvent.change(screen.getByPlaceholderText('Enter article title'), {
      target: { value: 'Created article' },
    });
    fireEvent.click(screen.getAllByRole('button', { name: 'Start upload' })[0]);
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    });
    first.unmount();
    if (action === 'Cancel') {
      const retained = mount();
      fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
      retained.unmount();
    } else
      act(() => {
        store.set(currentUserState, null);
        store.set(currentUserState, { _id: 'user-1', isOnboarded: true });
      });
    mount();
    expect(
      screen.getByPlaceholderText<HTMLInputElement>('Enter article title')
        .value,
    ).toBe('');
    act(() => mockUploads[0]('obsolete-created-image.png'));
    fireEvent.change(screen.getByPlaceholderText('Enter article title'), {
      target: { value: 'Second article' },
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Save' }));
    });
    expect(mockEdit).toHaveBeenLastCalledWith({
      variables: {
        doc: expect.objectContaining({
          title: 'Second article',
          image: undefined,
        }),
      },
    });
  },
);
