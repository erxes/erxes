import Link from 'next/link';
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
      className="group flex items-start gap-4 rounded-xl px-5 py-4 outline-none transition-colors duration-300 ease-out-soft hover:bg-subtle focus-visible:bg-subtle"
    >
      <span
        aria-hidden="true"
        className="mt-0.5 w-6 shrink-0 font-mono text-[12px] font-semibold tabular-nums text-muted-foreground/40 transition-colors duration-300 group-hover:text-brand"
      >
        {String(index + 1).padStart(2, '0')}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold leading-snug text-ink transition-colors duration-300 group-hover:text-brand">
          {article.title}
        </span>
        {article.summary ? (
          <span className="mt-1 block truncate text-[13px] leading-relaxed text-muted-foreground">
            {article.summary}
          </span>
        ) : null}
      </span>

      <span className="hidden shrink-0 items-center gap-4 pt-0.5 text-[12px] tabular-nums text-muted-foreground sm:flex">
        <span className="inline-flex items-center gap-1.5">
          <Icon name="clock" size={13} />
          {formatDate(article.modifiedAt)}
        </span>
        {article.viewCount > 0 ? (
          <span className="inline-flex items-center gap-1.5">
            <Icon name="eye" size={13} />
            {article.viewCount.toLocaleString('en-US')}
          </span>
        ) : null}
      </span>

      <span
        aria-hidden="true"
        className="mt-0.5 shrink-0 text-muted-foreground/40 transition-[transform,color] duration-500 ease-out-soft group-hover:translate-x-1 group-hover:text-brand"
      >
        <Icon name="chevronRight" size={16} />
      </span>
    </Link>
  </li>
);
