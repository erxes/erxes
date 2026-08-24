import { Avatar } from '@/modules/ui/Avatar';
import { EmptyState } from '@/modules/ui/EmptyState';
import { Icon } from '@/modules/ui/Icon';
import type { PortalArticle } from '../normalize';
import { formatDate } from '../selectors';

export const ArticleView = ({ article }: { article: PortalArticle }) => (
  <article className="rounded-xl border border-line bg-white p-6 sm:p-8">
    <h1 className="text-2xl font-semibold leading-snug text-ink sm:text-[26px]">
      {article.title}
    </h1>

    <div className="mt-5 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-muted">
      <span className="flex items-center gap-2.5">
        <Avatar name={article.author} size={32} />
        <span>
          Published by{' '}
          <span className="font-semibold text-ink">{article.author}</span>
        </span>
      </span>
      <span>
        Modified at{' '}
        <span className="font-semibold text-ink">
          {formatDate(article.modifiedAt)}
        </span>
      </span>
      <span className="flex items-center gap-1.5">
        <Icon name="eye" size={15} />
        {article.viewCount}
      </span>
    </div>

    <hr className="my-6 border-line" />

    {article.content ? (
      <div
        className="kb-article"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    ) : (
      <EmptyState
        icon="article"
        title="Агуулга хоосон байна"
        description="Энэ нийтлэлд одоогоор бичвэр оруулаагүй байна."
      />
    )}
  </article>
);
