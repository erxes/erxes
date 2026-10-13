import { TKbArticle, TKbCategory } from '../types/knowledgeBaseTypes';
import { categoryIcon } from '../utils/categoryIcon';
import {
  articleCount,
  articleCountLabel,
  childCategories,
} from '../utils/knowledgeBaseUtils';
import { KbRow } from './KbRow';

export const KbArticleRows = ({
  articles,
  onOpen,
}: {
  articles: TKbArticle[];
  onOpen: (articleId: string) => void;
}) => (
  <div className="flex flex-col gap-2">
    {articles.map((article) => (
      <KbRow
        key={article._id}
        title={article.title}
        description={article.summary}
        onClick={() => onOpen(article._id)}
      />
    ))}
  </div>
);

export const KbCategoryRows = ({
  categories,
  items,
  onOpen,
}: {
  categories: TKbCategory[];
  items: TKbCategory[];
  onOpen: (categoryId: string) => void;
}) => (
  <div className="flex flex-col gap-2">
    {items.map((category) => {
      const sections = childCategories(categories, category._id).length;
      const count = articleCountLabel(articleCount(categories, category));

      return (
        <KbRow
          key={category._id}
          title={category.title}
          description={category.description}
          icon={categoryIcon(category.icon)}
          meta={sections ? `${count} · ${sections} sections` : count}
          onClick={() => onOpen(category._id)}
        />
      );
    })}
  </div>
);
