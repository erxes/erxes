import type { ButtonHTMLAttributes, PropsWithChildren } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { KnowledgeBaseRecordPanel } from '../KnowledgeBaseRecordPanel';

const mockConfirm = jest.fn<Promise<void>, [unknown]>();
const mockRemove = jest.fn<Promise<void>, [string[]]>();
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, fallback?: string | { defaultValue?: string }) =>
      typeof fallback === 'string' ? fallback : (fallback?.defaultValue ?? key),
  }),
}));
jest.mock('react-router-dom', () => ({ useNavigate: () => jest.fn() }));
jest.mock('@apollo/client', () => ({ useQuery: () => ({ loading: false }) }));
jest.mock('erxes-ui', () => {
  const Box = ({ children }: PropsWithChildren) => <div>{children}</div>;
  return {
    Button: ({
      children,
      disabled,
      onClick,
      'aria-label': label,
    }: ButtonHTMLAttributes<HTMLButtonElement>) => (
      <button disabled={disabled} onClick={onClick} aria-label={label}>
        {children}
      </button>
    ),
    DropdownMenu: Object.assign(Box, {
      Trigger: Box,
      Content: Box,
      Item: ({
        children,
        disabled,
        onSelect,
      }: PropsWithChildren<{ disabled?: boolean; onSelect?: () => void }>) => (
        <button disabled={disabled} onClick={onSelect}>
          {children}
        </button>
      ),
    }),
    Empty: Object.assign(Box, { Header: Box, Title: Box, Description: Box }),
    ScrollArea: Box,
    Skeleton: Box,
    Spinner: Box,
    useQueryState: () => [null, jest.fn()],
    useConfirm: () => ({ confirm: mockConfirm }),
    useToast: () => ({ toast: jest.fn() }),
  };
});
jest.mock('ui-modules', () => ({
  useSidePanel: () => ({ close: jest.fn() }),
  useSidePanelDraft: () => ({}),
}));
jest.mock('@/knowledgebase/articles/hooks/useArticles', () => ({
  useArticleDetail: () => ({
    article: {
      _id: 'article-1',
      title: 'Article',
      topicId: 'topic-1',
      categoryId: 'category-1',
    },
    loading: false,
  }),
}));
jest.mock('@/knowledgebase/articles/hooks/useArticleMutations', () => ({
  useDuplicateArticle: () => ({ duplicateArticle: jest.fn(), loading: false }),
  useRemoveArticles: () => ({ removeArticles: mockRemove, loading: false }),
}));
jest.mock('@/knowledgebase/articles/components/ArticleDrawer', () => ({
  ArticleDrawer: () => <form aria-label="Article editor" />,
}));
jest.mock('@/knowledgebase/categories/components/CategoryDrawer', () => ({
  CategoryDrawer: () => null,
}));
jest.mock('@/knowledgebase/topics/components/TopicDrawer', () => ({
  TopicDrawer: () => null,
}));
jest.mock('@/knowledgebase/categories/hooks/useConfirmRemoveCategory', () => ({
  useConfirmRemoveCategory: () => ({
    confirmRemoveCategory: jest.fn(),
    loading: false,
  }),
}));
jest.mock('@/knowledgebase/shared/hooks/useTopicDetail', () => ({
  useTopicDetail: () => ({}),
}));
jest.mock('@/knowledgebase/shared/components/TopicEmbedScriptDialog', () => ({
  TopicEmbedScriptDialog: () => null,
}));
jest.mock('@/knowledgebase/graphql/queries', () => ({ CATEGORY_DETAIL: {} }));

beforeEach(() => {
  jest.clearAllMocks();
  mockConfirm.mockImplementation(() => new Promise(() => undefined));
});

it('renders a supported Activity empty state without mounting the edit form', () => {
  const panel = render(
    <KnowledgeBaseRecordPanel
      contentType="frontline:knowledgebase.article"
      contentId="article-1"
      view="detail"
    />,
  );
  expect(screen.getByRole('form', { name: 'Article editor' })).not.toBeNull();
  panel.rerender(
    <KnowledgeBaseRecordPanel
      contentType="frontline:knowledgebase.article"
      contentId="article-1"
      view="activity"
    />,
  );
  expect(screen.queryByRole('form', { name: 'Article editor' })).toBeNull();
  expect(
    screen.getByText(
      'Activity history is not available for knowledge base records.',
    ),
  ).toBeTruthy();
});

it('keeps actions usable while a dismissed confirmation never resolves', () => {
  render(
    <KnowledgeBaseRecordPanel
      contentType="frontline:knowledgebase.article"
      contentId="article-1"
      view="actions"
    />,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
  expect(mockConfirm).toHaveBeenCalledTimes(1);
  expect(
    screen.getByRole<HTMLButtonElement>('button', { name: 'Actions' }).disabled,
  ).toBe(false);
  fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
  expect(mockConfirm).toHaveBeenCalledTimes(2);
  expect(mockRemove).not.toHaveBeenCalled();
});

it('disables actions only while an affirmed removal is pending', async () => {
  mockConfirm.mockResolvedValue();
  let finish: () => void = () => undefined;
  mockRemove.mockImplementation(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  render(
    <KnowledgeBaseRecordPanel
      contentType="frontline:knowledgebase.article"
      contentId="article-1"
      view="actions"
    />,
  );
  await act(() => {
    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    return Promise.resolve();
  });
  expect(
    screen.getByRole<HTMLButtonElement>('button', { name: 'Actions' }).disabled,
  ).toBe(true);
  await act(() => {
    finish();
    return Promise.resolve();
  });
  expect(mockRemove).toHaveBeenCalledWith(['article-1']);
  expect(
    screen.getByRole<HTMLButtonElement>('button', { name: 'Actions' }).disabled,
  ).toBe(false);
});
