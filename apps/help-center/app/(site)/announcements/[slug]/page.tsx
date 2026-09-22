import { notFound } from 'next/navigation';
import { getAnnouncement } from '@/modules/cms/api';
import { formatDate } from '@/modules/cms/utils/format';
import { PortalShell } from '@/modules/layout/components/PortalShell';
import { ButtonLink } from '@/modules/ui/components/Button';
import { Card } from '@/modules/ui/components/Card';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import { RichText } from '@/modules/ui/components/RichText';
import { Icon } from '@/modules/ui/components/Icon';
import { IconOrb } from '@/modules/ui/components/IconOrb';
import {
  LoadError,
  SetupNotice,
  Unpublished,
} from '@/modules/ui/components/PortalState';

type Props = { params: Promise<{ slug: string }> };

const crumbs = (label: string) => [
  { label: 'Home', href: '/' },
  { label: 'Announcements', href: '/announcements' },
  { label },
];

export const generateMetadata = async ({ params }: Props) => {
  const { slug } = await params;
  const post = await getAnnouncement(decodeURIComponent(slug));

  return {
    title:
      post.state === 'ready' && post.data
        ? post.data.title ?? 'Announcement'
        : 'Announcement',
  };
};

export default async function AnnouncementPage({ params }: Props) {
  const { slug } = await params;

  const post = await getAnnouncement(decodeURIComponent(slug));

  if (post.state !== 'ready') {
    return (
      <PortalShell breadcrumbs={crumbs('Announcement')} title="Announcement">
        {post.state === 'unconfigured' ? (
          <SetupNotice missing={post.missing} />
        ) : post.state === 'unpublished' ? (
          <Unpublished domain={post.domain} />
        ) : (
          <LoadError message={post.message} />
        )}
      </PortalShell>
    );
  }

  if (!post.data) {
    notFound();
  }

  const title = post.data.title ?? 'Untitled announcement';
  const published = formatDate(post.data.publishedDate ?? post.data.createdAt);

  return (
    <PortalShell
      breadcrumbs={crumbs(title)}
      title={title}
      meta={
        <span className="inline-flex items-center gap-1.5 text-[13px] text-white/60">
          <Icon name="clock" size={14} />
          {published}
        </span>
      }
    >
      <div className="animate-in fade-in slide-in-from-bottom-1 fill-mode-both duration-500">
        <article className="rounded-2xl bg-white p-6 shadow-shell sm:p-9">
          {post.data.content ? (
            <RichText html={post.data.content} />
          ) : (
            <EmptyState
              icon="megaphone"
              title="This announcement is empty"
              description="No content has been added to this announcement."
            />
          )}
        </article>

        <Card className="mt-5 flex flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-3.5">
            <IconOrb name="megaphone" size="sm" />
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold text-ink">
                More from the team
              </h2>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                Browse every notice and update.
              </p>
            </div>
          </div>

          <ButtonLink href="/announcements" size="sm" variant="secondary">
            All announcements
            <Icon name="chevronRight" size={15} />
          </ButtonLink>
        </Card>
      </div>
    </PortalShell>
  );
}
