import Link from 'next/link';
import { Avatar } from '@/modules/ui/Avatar';
import { Icon } from '@/modules/ui/Icon';
import type { PortalArticle } from '../normalize';
import { formatDate } from '../selectors';

export const ArticleListItem = ({ article }: { article: PortalArticle }) => (
  <li>
    <Link
      href={`/knowledge-base/article/${article._id}`}
      className="block rounded-lg px-4 py-4 transition-colors hover:bg-subtle"
    >
      <span className="flex items-start gap-3">
        <span className="mt-0.5 text-muted">
          <Icon name="article" size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-semibold text-ink">
            {article.title}
          </span>
          {article.summary ? (
            <span className="mt-1 block text-sm leading-relaxed text-muted">
              {article.summary}
            </span>
          ) : null}
          <span className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-muted">
            <span className="flex items-center gap-1.5">
              <Avatar name={article.author} size={20} />
              {article.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="clock" size={14} />
              {formatDate(article.modifiedAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="eye" size={14} />
              {article.viewCount}
            </span>
          </span>
        </span>
      </span>
    </Link>
  </li>
);
