import { getAnnouncements } from '@/modules/cms/api';
import { AnnouncementList } from '@/modules/cms/components/AnnouncementList';
import { PortalShell } from '@/modules/layout/components/PortalShell';
import { CountBadge } from '@/modules/ui/components/PageHeader';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import {
  LoadError,
  SetupNotice,
  Unpublished,
} from '@/modules/ui/components/PortalState';

export const metadata = { title: 'Announcements' };

export default async function AnnouncementsPage() {
  const posts = await getAnnouncements();

  return (
    <PortalShell
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Announcements' }]}
      title="Announcements"
      description="Notices and updates from the team."
      meta={
        posts.state === 'ready' && posts.data.length ? (
          <CountBadge count={posts.data.length} label="posts" />
        ) : null
      }
    >
      {posts.state === 'unconfigured' ? (
        <SetupNotice missing={posts.missing} />
      ) : posts.state === 'unpublished' ? (
        <Unpublished domain={posts.domain} />
      ) : posts.state === 'error' ? (
        <LoadError message={posts.message} />
      ) : posts.data.length ? (
        <AnnouncementList posts={posts.data} featureFirst />
      ) : (
        <EmptyState
          icon="megaphone"
          title="No announcements yet"
          description="Nothing has been published in the CMS yet. New notices appear here as soon as they go live."
        />
      )}
    </PortalShell>
  );
}
