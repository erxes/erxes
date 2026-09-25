import Link from 'next/link';
import { Card } from '@/modules/ui/components/Card';
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
  <Card className="p-2">
    <ul className="divide-y divide-line-soft">
      {posts.map((post, index) => {
        const lead = featureFirst && index === 0;

        return (
          <li key={post._id}>
            <Link
              href={announcementHref(post)}
              className="group flex items-start gap-4 rounded-xl px-5 py-4 outline-none transition-colors duration-300 ease-out-soft hover:bg-subtle focus-visible:bg-subtle"
            >
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    'block font-semibold leading-snug text-ink transition-colors duration-300 group-hover:text-brand',
                    lead ? 'text-[19px] tracking-[-0.02em]' : 'text-[15px]',
                  )}
                >
                  {post.title ?? 'Untitled announcement'}
                </span>

                {post.excerpt ? (
                  <span
                    className={cn(
                      'mt-1 block leading-relaxed text-muted-foreground',
                      lead
                        ? 'line-clamp-2 text-[14px]'
                        : 'truncate text-[13px]',
                    )}
                  >
                    {post.excerpt}
                  </span>
                ) : null}
              </span>

              <span className="hidden shrink-0 items-center gap-1.5 pt-0.5 text-[12px] tabular-nums text-muted-foreground sm:flex">
                <Icon name="clock" size={13} />
                {formatDate(post.publishedDate ?? post.createdAt)}
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
      })}
    </ul>
  </Card>
);
