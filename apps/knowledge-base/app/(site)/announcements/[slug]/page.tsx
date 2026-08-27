import { notFound } from 'next/navigation';
import { getAnnouncement } from '@/modules/cms/api';
import { formatDate } from '@/modules/cms/utils/format';
import { getPortalIdentity } from '@/modules/layout/api';
import { Hero } from '@/modules/layout/components/Hero';
import { Breadcrumbs } from '@/modules/ui/components/Breadcrumbs';
import { ButtonLink } from '@/modules/ui/components/Button';
import { Card } from '@/modules/ui/components/Card';
import { Container } from '@/modules/ui/components/Container';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import { RichText } from '@/modules/ui/components/RichText';
import { Icon } from '@/modules/ui/components/Icon';
import { LoadError, SetupNotice } from '@/modules/ui/components/PortalState';

type Props = { params: Promise<{ slug: string }> };

export const generateMetadata = async ({ params }: Props) => {
  const { slug } = await params;
  const post = await getAnnouncement(decodeURIComponent(slug));

  return {
    title:
      post.state === 'ready' && post.data
        ? post.data.title ?? 'Зарлал'
        : 'Зарлал',
  };
};

export default async function AnnouncementPage({ params }: Props) {
  const [{ headline }, { slug }] = await Promise.all([
    getPortalIdentity(),
    params,
  ]);

  const post = await getAnnouncement(decodeURIComponent(slug));

  if (post.state === 'ready' && !post.data) {
    notFound();
  }

  return (
    <>
      <Hero headline={headline} />

      <Container width="text" className="py-10 lg:py-14">
        <Breadcrumbs
          items={[
            { label: 'Нүүр', href: '/' },
            { label: 'Мэдээ мэдээлэл', href: '/announcements' },
            {
              label:
                post.state === 'ready'
                  ? post.data?.title ?? 'Зарлал'
                  : 'Зарлал',
            },
          ]}
        />

        <div className="mt-7">
          {post.state === 'unconfigured' ? (
            <SetupNotice missing={post.missing} />
          ) : post.state === 'error' ? (
            <LoadError message={post.message} />
          ) : !post.data ? null : (
            <>
              <article className="rounded-xl border border-line bg-white p-6 sm:p-8">
                <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
                  <Icon name="megaphone" size={15} />
                  {formatDate(post.data.publishedDate ?? post.data.createdAt)}
                </p>
                <h1 className="mt-3 text-2xl font-semibold leading-snug text-ink sm:text-[26px]">
                  {post.data.title ?? 'Гарчиггүй зарлал'}
                </h1>
                {post.data.excerpt ? (
                  <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                    {post.data.excerpt}
                  </p>
                ) : null}

                <hr className="my-6 border-line" />

                {post.data.content ? (
                  <RichText html={post.data.content} />
                ) : (
                  <EmptyState
                    icon="megaphone"
                    title="Агуулга хоосон байна"
                    description="Энэ зарлалд бичвэр оруулаагүй байна."
                  />
                )}
              </article>

              <Card className="mt-6 flex flex-wrap items-center justify-between gap-4 p-6">
                <p className="text-sm text-muted-foreground">
                  Бусад зарлал, шинэчлэлтийг үзнэ үү.
                </p>
                <ButtonLink href="/announcements" size="sm" variant="secondary">
                  Бүх зарлал
                </ButtonLink>
              </Card>
            </>
          )}
        </div>
      </Container>
    </>
  );
}
