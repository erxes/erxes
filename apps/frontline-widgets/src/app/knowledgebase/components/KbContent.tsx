import { TKbArticle, TKbCategory } from '../types/knowledgeBaseTypes';
import { KbArticleView } from './KbArticleView';
import { KbCategoryView } from './KbCategoryView';
import { KbHomeView } from './KbHomeView';
import { KbEmptyState, KbLoadingState } from './KbStates';

export const KbContent = ({
  isUnavailable,
  isLoading,
  categories,
  category,
  article,
  term,
  onOpenCategory,
  onOpenArticle,
}: {
  isUnavailable: boolean;
  isLoading: boolean;
  categories: TKbCategory[];
  category?: TKbCategory;
  article?: TKbArticle;
  term: string;
  onOpenCategory: (categoryId: string) => void;
  onOpenArticle: (articleId: string) => void;
}) => {
  if (isUnavailable) {
    return (
      <KbEmptyState
        title="Knowledge base unavailable"
        text="This help content could not be loaded. Please try again later."
      />
    );
  }

  if (isLoading) {
    return <KbLoadingState />;
  }

  if (article) {
    return <KbArticleView article={article} />;
  }

  if (category) {
    return (
      <KbCategoryView
        categories={categories}
        category={category}
        onOpenCategory={onOpenCategory}
        onOpenArticle={onOpenArticle}
      />
    );
  }

  return (
    <KbHomeView
      categories={categories}
      term={term}
      onOpenCategory={onOpenCategory}
      onOpenArticle={onOpenArticle}
    />
  );
};
