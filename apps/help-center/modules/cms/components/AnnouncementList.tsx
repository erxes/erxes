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
  <ul className="@container divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
    {posts.map((post, index) => {
      const lead = featureFirst && index === 0;

      return (
        <li key={post._id}>
          <Link
            href={announcementHref(post)}
            className="group flex flex-col gap-1.5 px-5 py-4 outline-none transition-colors duration-150 hover:bg-subtle/70 focus-visible:bg-subtle @2xl:flex-row @2xl:gap-8 @2xl:py-5"
          >
            <span className="shrink-0 font-mono text-xs uppercase tracking-wide text-muted-foreground @2xl:w-28 @2xl:pt-1">
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
