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
import { Breadcrumbs } from '@/modules/ui/components/Breadcrumbs';
import { buttonClass, ButtonLink } from '@/modules/ui/components/Button';
import { Card, CardLink, cardLinkClass } from '@/modules/ui/components/Card';
import { Container } from '@/modules/ui/components/Container';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import { Reveal } from '@/modules/ui/components/Reveal';
import { Section } from '@/modules/ui/components/Section';
import { Icon } from '@/modules/ui/components/Icon';
import {
  LoadError,
  SetupNotice,
  Unpublished,
} from '@/modules/ui/components/PortalState';

const ActionCard = ({
  href,
  icon,
  title,
  description,
  reason,
}: {
  href: string;
  icon: 'inbox' | 'binoculars';
  title: string;
  description: string;
  reason?: string;
}) => {
  const className = cardLinkClass('group flex items-center gap-3.5 px-4 py-3.5');
  const body = (
    <>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand transition-colors group-hover:bg-brand group-hover:text-white">
        <Icon name={icon} size={19} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-ink">{title}</span>
        <span className="mt-0.5 block text-[13px] leading-relaxed text-muted-foreground">
          {description}
        </span>
      </span>
      <span className="shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-brand">
        <Icon name="chevronRight" size={17} />
      </span>
    </>
  );

  return reason ? (
    <SessionLink href={href} reason={reason} className={className}>
      {body}
    </SessionLink>
  ) : (
    <CardLink href={href} className={className}>
      {body}
    </CardLink>
  );
};

export default async function HomePage() {
  const [{ headline, title }, topic, announcements, forms] = await Promise.all([
    getPortalIdentity(),
    getTopicOverview(),
    getAnnouncements(5),
    getPortalForms(),
  ]);

  const knowledgeBaseEnabled =
    topic.state !== 'ready' || topic.data.knowledgeBaseEnabled;
  const ticketsEnabled = topic.state !== 'ready' || topic.data.ticketsEnabled;

  const portalForms = forms.state === 'ready' ? forms.data : [];

  return (
    <>
      <Hero headline={headline} />

      <Container className="py-9 lg:py-12">
        <Breadcrumbs items={[{ label: title, href: '/' }, { label: 'Home' }]} />

        <h1 className="mt-5 text-[30px] font-semibold tracking-[-0.02em] text-ink sm:text-[34px]">
          Support portal
        </h1>

        {ticketsEnabled ? (
          <Reveal className="mt-6 grid gap-3 sm:grid-cols-2">
            <ActionCard
              href={NEW_TICKET_ROUTE}
              reason={NEW_TICKET_REASON}
              icon="inbox"
              title="Submit a ticket"
              description="Fill in the form to raise a new ticket with the support team."
            />
            <ActionCard
              href="/tickets/track"
              icon="binoculars"
              title="Track a ticket"
              description="No account? Use your ticket number to check its status."
            />
          </Reveal>
        ) : null}

        <div className="mt-10 space-y-10 lg:mt-12 lg:space-y-12">
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

          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-8">
            <Section
              icon="megaphone"
              title="Announcements"
              description="See the latest notices and updates."
              action={
                announcements.state === 'ready' && announcements.data.length ? (
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
              ) : announcements.data.length ? (
                <Card className="px-3 py-1">
                  <AnnouncementList posts={announcements.data} />
                </Card>
              ) : (
                <EmptyState
                  icon="megaphone"
                  title="No announcements yet"
                  description="Nothing has been published in the CMS yet. New notices appear here."
                />
              )}
            </Section>

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
