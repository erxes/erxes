import Link from 'next/link';
import { Icon } from '@/modules/ui/components/Icon';
import { cn } from '@/modules/ui/lib/cn';
import { announcementHref, formatDate } from '../utils/format';
import type { CmsPost } from '../types';

export const AnnouncementList = ({
  posts,
  featureFirst = false,
}: {
  posts: CmsPost[];
  featureFirst?: boolean;
}) => (
  <ul className="divide-y divide-line rounded-2xl border border-line bg-white px-5 sm:px-6">
    {posts.map((post, index) => {
      const lead = featureFirst && index === 0;

      return (
        <li key={post._id}>
          <Link
            href={announcementHref(post)}
            className={cn(
              'group flex flex-col gap-1 py-5 outline-none sm:flex-row sm:gap-8',
            )}
          >
            <span className="shrink-0 pt-1 font-mono text-xs uppercase tracking-wide text-muted-foreground sm:w-28">
              {formatDate(post.publishedDate ?? post.createdAt)}
            </span>

            <span className="min-w-0 flex-1">
              <span
                className={cn(
                  'block font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-brand',
                  lead
                    ? 'text-xl tracking-[-0.02em] sm:text-2xl'
                    : 'text-[15px]',
                )}
              >
                {post.title ?? 'Untitled announcement'}
              </span>

              {post.excerpt ? (
                <span
                  className={cn(
                    'mt-1.5 block leading-relaxed text-muted-foreground',
                    lead ? 'line-clamp-3 text-[15px]' : 'line-clamp-2 text-sm',
                  )}
                >
                  {post.excerpt}
                </span>
              ) : null}

              <span className="mt-2.5 inline-flex items-center gap-1 text-[13px] font-medium text-muted-foreground transition-colors duration-200 group-hover:text-brand">
                Read
                <Icon
                  name="chevronRight"
                  size={14}
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                />
              </span>
            </span>
          </Link>
        </li>
      );
    })}
  </ul>
);
