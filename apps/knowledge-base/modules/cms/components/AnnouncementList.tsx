import Link from 'next/link';
import { Icon } from '@/modules/ui/components/Icon';
import { announcementHref, formatDate } from '../utils/format';
import type { CmsPost } from '../types';

export const AnnouncementList = ({ posts }: { posts: CmsPost[] }) => (
  <ul className="divide-y divide-line">
    {posts.map((post) => (
      <li key={post._id}>
        <Link
          href={announcementHref(post)}
          className="block rounded-lg px-3 py-4 transition-colors hover:bg-subtle"
        >
          <span className="flex items-start gap-3">
            <span className="mt-0.5 text-muted-foreground">
              <Icon name="megaphone" size={18} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-semibold text-ink">
                {post.title ?? 'Гарчиггүй зарлал'}
              </span>
              {post.excerpt ? (
                <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                  {post.excerpt}
                </span>
              ) : null}
              <span className="mt-2 flex items-center gap-1.5 text-[13px] text-muted-foreground">
                <Icon name="clock" size={14} />
                {formatDate(post.publishedDate ?? post.createdAt)}
              </span>
            </span>
          </span>
        </Link>
      </li>
    ))}
  </ul>
);
