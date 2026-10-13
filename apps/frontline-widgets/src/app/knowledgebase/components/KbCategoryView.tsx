import { TKbCategory } from '../types/knowledgeBaseTypes';
import { childCategories } from '../utils/knowledgeBaseUtils';
import { KbArticleRows, KbCategoryRows } from './KbRowLists';
import { KbEmptyState } from './KbStates';

const SectionLabel = ({ children }: { children: string }) => (
  <h2 className="mb-2 mt-4 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground first:mt-0">
    {children}
  </h2>
);

export const KbCategoryView = ({
  categories,
  category,
  onOpenCategory,
  onOpenArticle,
}: {
  categories: TKbCategory[];
  category: TKbCategory;
  onOpenCategory: (categoryId: string) => void;
  onOpenArticle: (articleId: string) => void;
}) => {
  const children = childCategories(categories, category._id);
  const articles = category.articles ?? [];

  if (!children.length && !articles.length) {
    return (
      <KbEmptyState
        title="No articles yet"
        text="This category does not have any published articles."
      />
    );
  }

  return (
    <>
      {children.length > 0 && (
        <>
          <SectionLabel>Sections</SectionLabel>
          <KbCategoryRows
            categories={categories}
            items={children}
            onOpen={onOpenCategory}
          />
        </>
      )}
      {articles.length > 0 && (
        <>
          <SectionLabel>Articles</SectionLabel>
          <KbArticleRows articles={articles} onOpen={onOpenArticle} />
        </>
      )}
    </>
  );
};
