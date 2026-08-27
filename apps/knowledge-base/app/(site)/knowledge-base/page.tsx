import { getTopicOverview } from '@/modules/knowledge-base/api';
import { SectionBlock } from '@/modules/knowledge-base/components/SectionBlock';
import { getPortalIdentity } from '@/modules/layout/api';
import { Hero } from '@/modules/layout/components/Hero';
import { Breadcrumbs } from '@/modules/ui/components/Breadcrumbs';
import { ButtonLink } from '@/modules/ui/components/Button';
import { Container } from '@/modules/ui/components/Container';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import { LoadError, SetupNotice } from '@/modules/ui/components/PortalState';

export const metadata = { title: 'Мэдлэгийн сан' };

export default async function KnowledgeBasePage() {
  const [{ headline }, topic] = await Promise.all([
    getPortalIdentity(),
    getTopicOverview(),
  ]);

  return (
    <>
      <Hero headline={headline} />

      <Container className="py-10 lg:py-14">
        <Breadcrumbs
          items={[{ label: 'Нүүр', href: '/' }, { label: 'Мэдлэгийн сан' }]}
        />

        <h1 className="mt-6 text-[28px] font-semibold text-ink">
          Мэдлэгийн сан
        </h1>

        <div className="mt-10">
          {topic.state === 'unconfigured' ? (
            <SetupNotice missing={topic.missing} />
          ) : topic.state === 'error' ? (
            <LoadError message={topic.message} />
          ) : topic.data.sections.length ? (
            <div className="space-y-14">
              {topic.data.sections.map((section) => (
                <SectionBlock key={section._id} section={section} />
              ))}
            </div>
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
        </div>
      </Container>
    </>
  );
}
