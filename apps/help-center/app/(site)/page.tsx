import { SessionLink } from '@/modules/auth/components/SessionLink';
import { getAnnouncements } from '@/modules/cms/api';
import { AnnouncementList } from '@/modules/cms/components/AnnouncementList';
import { getPortalForms } from '@/modules/forms/api';
import { FormList } from '@/modules/forms/components/FormList';
import { getTopicArticleList } from '@/modules/knowledge-base/api';
import type { PortalCategory } from '@/modules/knowledge-base/utils/normalize';
import { CategoryCard } from '@/modules/knowledge-base/components/CategoryCard';
import { knowledgeBaseName } from '@/modules/knowledge-base/utils/label';
import { getT } from '@/modules/i18n/server';
import { getPortalIdentity, getPortalSettings } from '@/modules/layout/api';
import { Hero } from '@/modules/layout/components/Hero';
import {
  HeroStats,
  type HeroStat,
} from '@/modules/layout/components/HeroStats';
import { SupportCta } from '@/modules/layout/components/SupportCta';
import {
  QuickLinks,
  type QuickLink,
} from '@/modules/layout/components/QuickLinks';
import { MyTickets } from '@/modules/tickets/components/MyTickets';
import { NEW_TICKET_ROUTE } from '@/modules/tickets/constants/guard';
import { BackToTop } from '@/modules/ui/components/BackToTop';
import { buttonClass, ButtonLink } from '@/modules/ui/components/Button';
import { Container } from '@/modules/ui/components/Container';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import { ScrollProgress } from '@/modules/ui/components/ScrollProgress';
import { Section } from '@/modules/ui/components/Section';
import { cn } from '@/modules/ui/lib/cn';
import { Icon } from '@/modules/ui/components/Icon';
import {
  LoadError,
  SetupNotice,
  Unpublished,
} from '@/modules/ui/components/PortalState';

const CATEGORY_PREVIEW = 5;

export default async function HomePage() {
  const [{ title, headline }, settings, topic, announcements, forms, t] =
    await Promise.all([
      getPortalIdentity(),
      getPortalSettings(),
      getTopicArticleList(),
      getAnnouncements(5),
      getPortalForms(),
      getT(),
    ]);

  const knowledgeBase = knowledgeBaseName(settings.knowledgeBaseLabel, t);

  const knowledgeBaseEnabled =
    topic.state !== 'ready' || topic.data.knowledgeBaseEnabled;
  const ticketsEnabled = topic.state !== 'ready' || topic.data.ticketsEnabled;

  const portalForms = forms.state === 'ready' ? forms.data : [];

  const allCategories =
    topic.state === 'ready'
      ? topic.data.sections.flatMap((section) =>
          section.children.length ? section.children : [section],
        )
      : [];

  const previewed = allCategories.slice(0, CATEGORY_PREVIEW);
  const lead = previewed.reduce<PortalCategory | null>(
    (best, category) =>
      !best || category.articleCount > best.articleCount ? category : best,
    null,
  );
  const categories = lead
    ? [lead, ...previewed.filter((category) => category._id !== lead._id)]
    : previewed;

  const articleCount = allCategories.reduce(
    (sum, category) => sum + category.articleCount,
    0,
  );

  const allStats: HeroStat[] = [
    {
      icon: 'book',
      value: articleCount,
      label: t('home.statArticles', { count: articleCount }),
    },
    {
      icon: 'grid',
      value: allCategories.length,
      label: t('home.statCategories', { count: allCategories.length }),
    },
    {
      icon: 'clipboard',
      value: portalForms.length,
      label: t('home.statForms', { count: portalForms.length }),
    },
  ];

  const stats = allStats.filter((stat) => stat.value > 0);

  const lede = ticketsEnabled
    ? t('home.ledeTickets', { kb: knowledgeBase.inline })
    : t('home.ledeForms', { kb: knowledgeBase.inline });

  const showAnnouncements =
    announcements.state !== 'ready' || announcements.data.length > 0;

  const quickLinks: QuickLink[] = ticketsEnabled
    ? [
        {
          href: NEW_TICKET_ROUTE,
          icon: 'ticket' as const,
          title: t('tickets.submit'),
          sessionReason: t('tickets.signInReason'),
          primary: true,
        },
        {
          href: '/tickets/track',
          icon: 'binoculars' as const,
          title: t('tickets.track'),
        },
      ]
    : [];

  return (
    <>
      <ScrollProgress />

      <Hero
        headline={headline}
        eyebrow={title}
        lede={lede}
        meta={stats.length ? <HeroStats stats={stats} /> : undefined}
      >
        {quickLinks.length ? <QuickLinks links={quickLinks} /> : null}
      </Hero>

      <Container className="pb-16 pt-14 lg:pb-24 lg:pt-20">
        <div className="space-y-12 lg:space-y-16">
          {knowledgeBaseEnabled ? (
            <Section
              icon="book"
              title={knowledgeBase.title}
              description={t('home.kbDescription')}
              action={
                topic.state === 'ready' && topic.data.sections.length ? (
                  <ButtonLink
                    href="/knowledge-base"
                    size="sm"
                    variant="secondary"
                  >
                    {t('kb.allCategories')}
                    <Icon name="chevronRight" size={15} />
                  </ButtonLink>
                ) : null
              }
            >
              {topic.state === 'unconfigured' ? (
                <SetupNotice missing={topic.missing} />
              ) : topic.state === 'unpublished' ? (
                <Unpublished domain={topic.domain} />
              ) : topic.state === 'error' ? (
                <LoadError message={topic.message} />
              ) : categories.length ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {categories.map((category, index) => (
                    <div
                      key={category._id}
                      className={cn(index === 0 && 'sm:col-span-2')}
                    >
                      <CategoryCard
                        category={category}
                        featured={index === 0}
                        index={index}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="book"
                  title={t('kb.empty', { name: knowledgeBase.title })}
                  description={t('kb.emptyText')}
                  action={
                    <SessionLink
                      href={NEW_TICKET_ROUTE}
                      reason={t('tickets.signInReason')}
                      className={buttonClass({ size: 'sm' })}
                    >
                      {t('tickets.create')}
                    </SessionLink>
                  }
                />
              )}
            </Section>
          ) : null}

          {portalForms.length ? (
            <Section
              icon="clipboard"
              title={t('nav.forms')}
              description={t('home.formsDescription')}
              action={
                portalForms.length > 4 ? (
                  <ButtonLink href="/forms" size="sm" variant="secondary">
                    {t('home.allForms')}
                    <Icon name="chevronRight" size={15} />
                  </ButtonLink>
                ) : null
              }
            >
              <FormList forms={portalForms.slice(0, 4)} />
            </Section>
          ) : null}

          {showAnnouncements ? (
            <Section
              icon="megaphone"
              title={t('nav.announcements')}
              description={t('home.announcementsDescription')}
              action={
                announcements.state === 'ready' && announcements.data.length ? (
                  <ButtonLink
                    href="/announcements"
                    size="sm"
                    variant="secondary"
                  >
                    {t('common.all')}
                    <Icon name="chevronRight" size={15} />
                  </ButtonLink>
                ) : null
              }
            >
              {announcements.state === 'unconfigured' ? (
                <SetupNotice missing={announcements.missing} />
              ) : announcements.state === 'unpublished' ? (
                <Unpublished domain={announcements.domain} />
              ) : announcements.state === 'error' ? (
                <LoadError message={announcements.message} />
              ) : (
                <AnnouncementList posts={announcements.data} />
              )}
            </Section>
          ) : null}

          <Section
            icon="ticket"
            title={t('tickets.mine')}
            description={t('home.ticketsDescription')}
            action={
              <ButtonLink href="/tickets" size="sm" variant="secondary">
                {t('common.all')}
                <Icon name="chevronRight" size={15} />
              </ButtonLink>
            }
          >
            <MyTickets limit={5} />
          </Section>

          <SupportCta
            ticketsEnabled={ticketsEnabled}
            formsEnabled={portalForms.length > 0}
          />
        </div>
      </Container>

      <BackToTop />
    </>
  );
}
