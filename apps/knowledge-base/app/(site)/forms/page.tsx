import { getPortalForms } from '@/modules/forms/api';
import { FormList } from '@/modules/forms/components/FormList';
import { getPortalIdentity } from '@/modules/layout/api';
import { Hero } from '@/modules/layout/components/Hero';
import { Breadcrumbs } from '@/modules/ui/components/Breadcrumbs';
import { ButtonLink } from '@/modules/ui/components/Button';
import { Container } from '@/modules/ui/components/Container';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import { LoadError, SetupNotice } from '@/modules/ui/components/PortalState';

export const metadata = { title: 'Маягт' };

export default async function FormsPage() {
  const [{ headline }, forms] = await Promise.all([
    getPortalIdentity(),
    getPortalForms(),
  ]);

  return (
    <>
      <Hero headline={headline} />

      <Container className="py-10 lg:py-14">
        <Breadcrumbs
          items={[{ label: 'Мэдлэгийн сан', href: '/' }, { label: 'Маягт' }]}
        />

        <h1 className="mt-6 text-[28px] font-semibold text-ink">Маягт</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Дэмжлэгийн баг руу мэдээлэл хүргэх бэлэн маягтуудыг эндээс бөглөнө үү.
        </p>

        <div className="mt-8">
          {forms.state === 'unconfigured' ? (
            <SetupNotice missing={forms.missing} />
          ) : forms.state === 'error' ? (
            <LoadError title="Маягтуудыг татаж чадсангүй" message={forms.message} />
          ) : forms.data.length ? (
            <FormList forms={forms.data} />
          ) : (
            <EmptyState
              icon="clipboard"
              title="Маягт байхгүй байна"
              description="Frontline → Forms хэсэгт маягтаа порталын тагаар тэмдэглэвэл энд харагдана."
              action={
                <ButtonLink href="/tickets/new" size="sm">
                  Хүсэлт илгээх
                </ButtonLink>
              }
            />
          )}
        </div>
      </Container>
    </>
  );
}
