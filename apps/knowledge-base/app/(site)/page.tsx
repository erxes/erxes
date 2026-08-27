import { getAnnouncements } from '@/modules/cms/api';
import { AnnouncementList } from '@/modules/cms/components/AnnouncementList';
import { getTopicOverview } from '@/modules/knowledge-base/api';
import { TopicOutline } from '@/modules/knowledge-base/components/TopicOutline';
import { getPortalIdentity } from '@/modules/layout/api';
import { Hero } from '@/modules/layout/components/Hero';
import { AccordionSection } from '@/modules/ui/components/Accordion';
import { Breadcrumbs } from '@/modules/ui/components/Breadcrumbs';
import { ButtonLink } from '@/modules/ui/components/Button';
import { CardLink } from '@/modules/ui/components/Card';
import { Container } from '@/modules/ui/components/Container';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import { Icon } from '@/modules/ui/components/Icon';
import { LoadError, SetupNotice } from '@/modules/ui/components/PortalState';

const ActionCard = ({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: 'inbox' | 'binoculars';
  title: string;
  description: string;
}) => (
  <CardLink href={href} className="flex items-start gap-4 p-6">
    <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand">
      <Icon name={icon} size={22} />
    </span>
    <span>
      <span className="block text-base font-semibold text-ink">{title}</span>
      <span className="mt-1.5 block text-sm leading-relaxed text-muted-foreground">
        {description}
      </span>
    </span>
  </CardLink>
);

export default async function HomePage() {
  const [{ headline, title }, topic, announcements] = await Promise.all([
    getPortalIdentity(),
    getTopicOverview(),
    getAnnouncements(5),
  ]);

  return (
    <>
      <Hero headline={headline} />

      <Container className="py-10 lg:py-14">
        <Breadcrumbs items={[{ label: title, href: '/' }, { label: 'Нүүр' }]} />

        <h1 className="mt-6 text-[28px] font-semibold text-ink">
          Дэмжлэгийн портал
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Хариултаа мэдлэгийн сангаас хайж олоод, олдохгүй бол дэмжлэгийн багт
          хүсэлт илгээнэ үү.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <ActionCard
            href="/tickets/new"
            icon="inbox"
            title="Хүсэлт илгээх"
            description="Дэмжлэгийн багт шинэ хүсэлт үүсгэх маягтыг бөглөнө үү."
          />
          <ActionCard
            href="/tickets/track"
            icon="binoculars"
            title="Хүсэлт хянах"
            description="Бүртгэлгүй юу? Хүсэлтийн дугаараа ашиглан төлөвөө шалгана уу."
          />
        </div>

        <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
          <AccordionSection
            id="knowledgebase"
            icon="book"
            title="Мэдлэгийн сан"
            description="Түгээмэл асуултын хариулт, заавар, бодлогыг ангиллаар нь үзнэ үү."
          >
            {topic.state === 'unconfigured' ? (
              <SetupNotice missing={topic.missing} />
            ) : topic.state === 'error' ? (
              <LoadError message={topic.message} />
            ) : topic.data.sections.length ? (
              <>
                <TopicOutline topic={topic.data} />
                <div className="mt-5">
                  <ButtonLink
                    href="/knowledge-base"
                    size="sm"
                    variant="secondary"
                  >
                    Бүх ангилал
                    <Icon name="chevronRight" size={15} />
                  </ButtonLink>
                </div>
              </>
            ) : (
              <EmptyState
                icon="book"
                title="Мэдлэгийн сан хоосон байна"
                description="Энэ сэдэвт нийтлэгдсэн ангилал алга. Frontline → Knowledge Base хэсгээс ангилал нэмнэ үү."
                action={
                  <ButtonLink href="/tickets/new" size="sm">
                    Хүсэлт үүсгэх
                  </ButtonLink>
                }
              />
            )}
          </AccordionSection>

          <AccordionSection
            id="announcements"
            icon="megaphone"
            title="Мэдээ мэдээлэл"
            description="Хамгийн сүүлийн үеийн зарлал, шинэчлэлтүүдийг үзнэ үү."
          >
            {announcements.state === 'unconfigured' ? (
              <SetupNotice missing={announcements.missing} />
            ) : announcements.state === 'error' ? (
              <LoadError message={announcements.message} />
            ) : announcements.data.length ? (
              <>
                <AnnouncementList posts={announcements.data} />
                <div className="mt-5">
                  <ButtonLink
                    href="/announcements"
                    size="sm"
                    variant="secondary"
                  >
                    Бүх зарлал
                    <Icon name="chevronRight" size={15} />
                  </ButtonLink>
                </div>
              </>
            ) : (
              <EmptyState
                icon="megaphone"
                title="Зарлал байхгүй байна"
                description="CMS дээр нийтлэгдсэн зарлал алга. Шинэ мэдээлэл гармагц энд харагдана."
              />
            )}
          </AccordionSection>
        </div>
      </Container>
    </>
  );
}
