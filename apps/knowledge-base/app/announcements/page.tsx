import { getAnnouncements } from '@/modules/cms/api';
import { AnnouncementList } from '@/modules/cms/components/AnnouncementList';
import { getPortalIdentity } from '@/modules/layout/api';
import { Hero } from '@/modules/layout/Hero';
import { Breadcrumbs } from '@/modules/ui/Breadcrumbs';
import { Card } from '@/modules/ui/Card';
import { EmptyState } from '@/modules/ui/EmptyState';
import { LoadError, SetupNotice } from '@/modules/ui/PortalState';

export const metadata = { title: 'Мэдээ мэдээлэл' };

export default async function AnnouncementsPage() {
  const [{ headline }, posts] = await Promise.all([
    getPortalIdentity(),
    getAnnouncements(),
  ]);

  return (
    <>
      <Hero headline={headline} />

      <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <Breadcrumbs
          items={[{ label: 'Нүүр', href: '/' }, { label: 'Мэдээ мэдээлэл' }]}
        />

        <h1 className="mt-6 text-[28px] font-semibold text-ink">
          Мэдээ мэдээлэл
        </h1>
        <p className="mt-2 text-sm text-muted">
          CMS дээр нийтлэгдсэн зарлал, шинэчлэлтүүд.
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
              title="Зарлал байхгүй байна"
              description="CMS дээр нийтлэгдсэн зарлал алга. Шинэ мэдээлэл нийтлэгдмэгц энд харагдана."
            />
          )}
        </div>
      </div>
    </>
  );
}
