import { TKbArticle } from '../types/knowledgeBaseTypes';
import { formatArticleDate } from '../utils/knowledgeBaseUtils';
import { KbArticleBody } from './KbArticleBody';

export const KbArticleView = ({ article }: { article: TKbArticle }) => {
  const updatedAt = formatArticleDate(article);

  return (
    <article>
      <h1 className="text-xl font-bold leading-snug text-foreground">
        {article.title}
      </h1>
      {updatedAt && (
        <p className="mt-1 text-xs text-muted-foreground">
          Updated {updatedAt}
        </p>
      )}
      <KbArticleBody html={article.content || ''} />
    </article>
  );
};
