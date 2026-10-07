import { getAnnouncements } from '@/modules/cms/api';
import { AnnouncementList } from '@/modules/cms/components/AnnouncementList';
import { getT } from '@/modules/i18n/server';
import { PortalShell } from '@/modules/layout/components/PortalShell';
import { CountBadge } from '@/modules/ui/components/PageHeader';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import {
  LoadError,
  SetupNotice,
  Unpublished,
} from '@/modules/ui/components/PortalState';

export const generateMetadata = async () => ({
  title: (await getT())('cms.title'),
});

export default async function AnnouncementsPage() {
  const [posts, t] = await Promise.all([getAnnouncements(), getT()]);

  return (
    <PortalShell
      breadcrumbs={[
        { label: t('nav.home'), href: '/' },
        { label: t('cms.title') },
      ]}
      title={t('cms.title')}
      description={t('cms.description')}
      meta={
        posts.state === 'ready' && posts.data.length ? (
          <CountBadge
            count={posts.data.length}
            label={t('cms.posts', { count: posts.data.length })}
          />
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
          title={t('cms.noneYet')}
          description={t('cms.noneYetText')}
        />
      )}
    </PortalShell>
  );
}
