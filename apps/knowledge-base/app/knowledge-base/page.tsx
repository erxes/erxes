import { getTopicOverview } from '@/modules/knowledge-base/api';
import { SectionBlock } from '@/modules/knowledge-base/components/SectionBlock';
import { getPortalIdentity } from '@/modules/layout/api';
import { Hero } from '@/modules/layout/Hero';
import { Breadcrumbs } from '@/modules/ui/Breadcrumbs';
import { ButtonLink } from '@/modules/ui/Button';
import { EmptyState } from '@/modules/ui/EmptyState';
import { LoadError, SetupNotice } from '@/modules/ui/PortalState';

export const metadata = { title: 'Мэдлэгийн сан' };

export default async function KnowledgeBasePage() {
  const [{ headline }, topic] = await Promise.all([
    getPortalIdentity(),
    getTopicOverview(),
  ]);

  return (
    <>
      <Hero headline={headline} />

      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
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
      </div>
    </>
  );
}
