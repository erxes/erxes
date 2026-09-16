import Link from 'next/link';
import { SessionLink } from '@/modules/auth/components/SessionLink';
import { getAnnouncements } from '@/modules/cms/api';
import { AnnouncementList } from '@/modules/cms/components/AnnouncementList';
import { getPortalForms } from '@/modules/forms/api';
import { FormList } from '@/modules/forms/components/FormList';
import { getTopicOverview } from '@/modules/knowledge-base/api';
import { TopicOutline } from '@/modules/knowledge-base/components/TopicOutline';
import { getPortalIdentity } from '@/modules/layout/api';
import { Hero } from '@/modules/layout/components/Hero';
import { MyTickets } from '@/modules/tickets/components/MyTickets';
import {
  NEW_TICKET_REASON,
  NEW_TICKET_ROUTE,
} from '@/modules/tickets/constants/guard';
import { buttonClass, ButtonLink } from '@/modules/ui/components/Button';
import { Card } from '@/modules/ui/components/Card';
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
    getTopicOverview(),
    getAnnouncements(5),
    getPortalForms(),
  ]);

  const knowledgeBaseEnabled =
    topic.state !== 'ready' || topic.data.knowledgeBaseEnabled;
  const ticketsEnabled = topic.state !== 'ready' || topic.data.ticketsEnabled;

  const portalForms = forms.state === 'ready' ? forms.data : [];

  const showAnnouncements =
    announcements.state !== 'ready' || announcements.data.length > 0;

  return (
    <>
      <Hero headline={headline}>
        {ticketsEnabled ? (
          <Link
            href="/tickets/track"
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[13px] font-medium text-white outline-none ring-1 ring-inset ring-white/20 transition-colors duration-200 hover:bg-white/20 hover:ring-white/35 focus-visible:ring-2 focus-visible:ring-white/70"
          >
            <Icon name="binoculars" size={15} />
            Track a ticket with your number
            <Icon name="chevronRight" size={14} />
          </Link>
        ) : null}
      </Hero>

      <Container className="pb-12 pt-12 lg:pb-16 lg:pt-16">
        <div className="space-y-10 lg:space-y-14">
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
              ) : topic.data.sections.length ? (
                <TopicOutline topic={topic.data} />
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
                  <Card className="px-3 py-1">
                    <AnnouncementList posts={announcements.data} />
                  </Card>
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
