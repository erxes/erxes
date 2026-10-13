import { useMemo } from 'react';
import { TKbCategory } from '../types/knowledgeBaseTypes';
import {
  articleCount,
  rootCategories,
  searchArticles,
} from '../utils/knowledgeBaseUtils';
import { KbArticleRows, KbCategoryRows } from './KbRowLists';
import { KbEmptyState } from './KbStates';

const KbSearchResults = ({
  categories,
  term,
  onOpenArticle,
}: {
  categories: TKbCategory[];
  term: string;
  onOpenArticle: (articleId: string) => void;
}) => {
  const results = useMemo(
    () => searchArticles(categories, term),
    [categories, term],
  );

  if (!results.length) {
    return (
      <KbEmptyState
        title="No results"
        text={`Nothing matches "${term}". Try another word.`}
      />
    );
  }

  return <KbArticleRows articles={results} onOpen={onOpenArticle} />;
};

export const KbHomeView = ({
  categories,
  term,
  onOpenCategory,
  onOpenArticle,
}: {
  categories: TKbCategory[];
  term: string;
  onOpenCategory: (categoryId: string) => void;
  onOpenArticle: (articleId: string) => void;
}) => {
  const searchTerm = term.trim();

  if (searchTerm) {
    return (
      <KbSearchResults
        categories={categories}
        term={searchTerm}
        onOpenArticle={onOpenArticle}
      />
    );
  }

  const roots = rootCategories(categories).filter(
    (item) => articleCount(categories, item) > 0,
  );

  if (!roots.length) {
    return (
      <KbEmptyState
        title="No articles yet"
        text="Help articles will appear here once they are published."
      />
    );
  }

  return (
    <KbCategoryRows
      categories={categories}
      items={roots}
      onOpen={onOpenCategory}
    />
  );
};
