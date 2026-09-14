import Link from 'next/link';
import { Avatar } from '@/modules/ui/components/Avatar';
import { Icon } from '@/modules/ui/components/Icon';
import type { PortalArticle } from '../utils/normalize';
import { formatDate } from '../utils/selectors';

export const ArticleListItem = ({
  article,
  index = 0,
}: {
  article: PortalArticle;
  index?: number;
}) => (
  <li
    className="animate-in fade-in slide-in-from-bottom-1 fill-mode-both duration-500"
    style={{ animationDelay: `${Math.min(index, 8) * 50}ms` }}
  >
    <Link
      href={`/knowledge-base/article/${article._id}`}
      className="group flex items-start gap-3.5 rounded-lg px-4 py-4 transition-colors duration-200 hover:bg-subtle"
    >
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-subtle text-muted-foreground transition-colors duration-200 group-hover:bg-brand-soft group-hover:text-brand">
        <Icon name="article" size={17} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-ink transition-colors duration-200 group-hover:text-brand">
          {article.title}
        </span>
        {article.summary ? (
          <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
            {article.summary}
          </span>
        ) : null}
        <span className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[13px] text-muted-foreground">
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

      <span className="mt-2 shrink-0 text-muted-foreground opacity-0 transition-all duration-200 group-hover:translate-x-0.5 group-hover:opacity-100">
        <Icon name="chevronRight" size={18} />
      </span>
    </Link>
  </li>
);
