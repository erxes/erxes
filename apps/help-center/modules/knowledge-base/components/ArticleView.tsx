import { Avatar } from '@/modules/ui/components/Avatar';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import { Icon } from '@/modules/ui/components/Icon';
import { RichText } from '@/modules/ui/components/RichText';
import type { PortalArticle } from '../utils/normalize';
import { formatDate } from '../utils/selectors';

export const ArticleView = ({ article }: { article: PortalArticle }) => (
  <article className="rounded-2xl bg-white p-6 shadow-shell sm:p-9">
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pb-6 text-[13px] text-muted-foreground">
      <span className="flex items-center gap-2.5">
        <Avatar name={article.author} size={30} />
        <span className="font-medium text-ink">{article.author}</span>
      </span>

      <span className="flex items-center gap-1.5">
        <Icon name="clock" size={14} />
        {formatDate(article.modifiedAt)}
      </span>

      {article.viewCount > 0 ? (
        <span className="flex items-center gap-1.5">
          <Icon name="eye" size={14} />
          {article.viewCount.toLocaleString('en-US')}
        </span>
      ) : null}
    </div>

    <div className="border-t border-line pt-7">
      {article.content ? (
        <RichText html={article.content} />
      ) : (
        <EmptyState
          icon="article"
          title="This article is empty"
          description="No content has been added to this article yet."
        />
      )}
    </div>
  </article>
);
