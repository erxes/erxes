import { SessionLink } from '@/modules/auth/components/SessionLink';
import { getAnnouncements } from '@/modules/cms/api';
import { AnnouncementList } from '@/modules/cms/components/AnnouncementList';
import { getPortalForms } from '@/modules/forms/api';
import { FormList } from '@/modules/forms/components/FormList';
import { getTopicArticleList } from '@/modules/knowledge-base/api';
import { CategoryCard } from '@/modules/knowledge-base/components/CategoryCard';
import { getPortalIdentity } from '@/modules/layout/api';
import { Hero } from '@/modules/layout/components/Hero';
import {
  QuickLinks,
  type QuickLink,
} from '@/modules/layout/components/QuickLinks';
import { MyTickets } from '@/modules/tickets/components/MyTickets';
import {
  NEW_TICKET_REASON,
  NEW_TICKET_ROUTE,
} from '@/modules/tickets/constants/guard';
import { buttonClass, ButtonLink } from '@/modules/ui/components/Button';
import { Container } from '@/modules/ui/components/Container';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import { Section } from '@/modules/ui/components/Section';
import { cn } from '@/modules/ui/lib/cn';
import { Icon } from '@/modules/ui/components/Icon';
import {
  LoadError,
  SetupNotice,
  Unpublished,
} from '@/modules/ui/components/PortalState';

export default async function HomePage() {
  const [{ headline }, topic, announcements, forms] = await Promise.all([
    getPortalIdentity(),
    getTopicArticleList(),
    getAnnouncements(5),
    getPortalForms(),
  ]);

  const knowledgeBaseEnabled =
    topic.state !== 'ready' || topic.data.knowledgeBaseEnabled;
  const ticketsEnabled = topic.state !== 'ready' || topic.data.ticketsEnabled;

  const portalForms = forms.state === 'ready' ? forms.data : [];

  const categories =
    topic.state === 'ready'
      ? topic.data.sections
          .flatMap((section) =>
            section.children.length ? section.children : [section],
          )
          .slice(0, 4)
      : [];

  const showAnnouncements =
    announcements.state !== 'ready' || announcements.data.length > 0;

  const quickLinks: QuickLink[] = ticketsEnabled
    ? [
        {
          href: NEW_TICKET_ROUTE,
          icon: 'ticket' as const,
          title: 'Submit a ticket',
          sessionReason: NEW_TICKET_REASON,
          primary: true,
        },
        {
          href: '/tickets/track',
          icon: 'binoculars' as const,
          title: 'Track a ticket',
        },
      ]
    : [];

  return (
    <>
      <Hero headline={headline}>
        {quickLinks.length ? <QuickLinks links={quickLinks} /> : null}
      </Hero>

      <Container className="pb-14 pt-12 lg:pb-20 lg:pt-16">
        <div className="space-y-12 lg:space-y-16">
          {knowledgeBaseEnabled ? (
            <Section
              icon="book"
              title="Knowledge base"
              description="Browse answers to common questions, guides, and policies by category."
              action={
                topic.state === 'ready' && topic.data.sections.length ? (
                  <ButtonLink
                    href="/knowledge-base"
                    size="sm"
                    variant="secondary"
                  >
                    All categories
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
                <div className="grid gap-5 sm:grid-cols-2">
                  {categories.map((category, index) => (
                    <CategoryCard
                      key={category._id}
                      category={category}
                      index={index}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon="book"
                  title="The knowledge base is empty"
                  description="This topic has no published categories. Add one under Frontline → Knowledge Base."
                  action={
                    <SessionLink
                      href={NEW_TICKET_ROUTE}
                      reason={NEW_TICKET_REASON}
                      className={buttonClass({ size: 'sm' })}
                    >
                      Create a ticket
                    </SessionLink>
                  }
                />
              )}
            </Section>
          ) : null}

          {portalForms.length ? (
            <Section
              icon="clipboard"
              title="Forms"
              description="Fill in a ready-made form to send details to the support team."
              action={
                portalForms.length > 4 ? (
                  <ButtonLink href="/forms" size="sm" variant="secondary">
                    All forms
                    <Icon name="chevronRight" size={15} />
                  </ButtonLink>
                ) : null
              }
            >
              <FormList forms={portalForms.slice(0, 4)} />
            </Section>
          ) : null}

          <div
            className={cn(
              'grid items-start gap-10',
              showAnnouncements && 'lg:grid-cols-2 lg:gap-8',
            )}
          >
            {showAnnouncements ? (
              <Section
                icon="megaphone"
                title="Announcements"
                description="See the latest notices and updates."
                action={
                  announcements.state === 'ready' &&
                  announcements.data.length ? (
                    <ButtonLink
                      href="/announcements"
                      size="sm"
                      variant="secondary"
                    >
                      All
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
              title="My tickets"
              description="Progress and replies on tickets you have raised."
              action={
                <ButtonLink href="/tickets" size="sm" variant="secondary">
                  All
                  <Icon name="chevronRight" size={15} />
                </ButtonLink>
              }
            >
              <MyTickets limit={5} />
            </Section>
          </div>
        </div>
      </Container>
    </>
  );
}
