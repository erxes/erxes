import { getAnnouncements } from '@/modules/cms/api';
import { AnnouncementList } from '@/modules/cms/components/AnnouncementList';
import { getPortalIdentity } from '@/modules/layout/api';
import { Hero } from '@/modules/layout/components/Hero';
import { Breadcrumbs } from '@/modules/ui/components/Breadcrumbs';
import { Card } from '@/modules/ui/components/Card';
import { Container } from '@/modules/ui/components/Container';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import { LoadError, SetupNotice } from '@/modules/ui/components/PortalState';

export const metadata = { title: 'Announcements' };

export default async function AnnouncementsPage() {
  const [{ headline }, posts] = await Promise.all([
    getPortalIdentity(),
    getAnnouncements(),
  ]);

  return (
    <>
      <Hero headline={headline} />

      <Container className="py-10 lg:py-14">
        <Breadcrumbs
          items={[{ label: 'Home', href: '/' }, { label: 'Announcements' }]}
        />

        <h1 className="mt-6 text-[30px] font-semibold tracking-[-0.02em] text-ink sm:text-[34px]">
          Announcements
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Notices and updates published in the CMS.
        </p>

        <div className="mt-7">
          {posts.state === 'unconfigured' ? (
            <SetupNotice missing={posts.missing} />
          ) : posts.state === 'error' ? (
            <LoadError message={posts.message} />
          ) : posts.data.length ? (
            <Card className="p-3">
              <AnnouncementList posts={posts.data} />
            </Card>
          ) : (
            <EmptyState
              icon="megaphone"
              title="No announcements yet"
              description="Nothing has been published in the CMS yet. New notices appear here as soon as they go live."
            />
          )}
        </div>
      </Container>
    </>
  );
}
