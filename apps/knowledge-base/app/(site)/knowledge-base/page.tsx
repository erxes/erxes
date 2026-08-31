import { getPortalForms } from '@/modules/forms/api';
import { FormList } from '@/modules/forms/components/FormList';
import { getTopicOverview } from '@/modules/knowledge-base/api';
import { SectionBlock } from '@/modules/knowledge-base/components/SectionBlock';
import { getPortalIdentity } from '@/modules/layout/api';
import { Hero } from '@/modules/layout/components/Hero';
import { Breadcrumbs } from '@/modules/ui/components/Breadcrumbs';
import { ButtonLink } from '@/modules/ui/components/Button';
import { Container } from '@/modules/ui/components/Container';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import { Icon } from '@/modules/ui/components/Icon';
import { LoadError, SetupNotice } from '@/modules/ui/components/PortalState';

export const metadata = { title: 'Мэдлэгийн сан' };

export default async function KnowledgeBasePage() {
  const [{ headline }, topic, forms] = await Promise.all([
    getPortalIdentity(),
    getTopicOverview(),
    getPortalForms(),
  ]);

  /*
   * Forms sit with the articles they belong beside; a portal with none
   * configured simply shows nothing here, and `/forms` reports why.
   */
  const portalForms = forms.state === 'ready' ? forms.data : [];

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

        {portalForms.length ? (
          <section className="mt-8 rounded-xl border border-line bg-white p-6">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 className="text-base font-semibold text-ink">Маягт</h2>
              <ButtonLink href="/forms" size="sm" variant="ghost">
                Бүх маягт
                <Icon name="chevronRight" size={15} />
              </ButtonLink>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Дэмжлэгийн багт мэдээлэл хүргэх бэлэн маягтууд.
            </p>
            <div className="mt-5">
              <FormList forms={portalForms.slice(0, 4)} />
            </div>
          </section>
        ) : null}

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
