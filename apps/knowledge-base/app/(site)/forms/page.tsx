import { getPortalForms } from '@/modules/forms/api';
import { FormList } from '@/modules/forms/components/FormList';
import { getPortalIdentity } from '@/modules/layout/api';
import { Hero } from '@/modules/layout/components/Hero';
import { Breadcrumbs } from '@/modules/ui/components/Breadcrumbs';
import { ButtonLink } from '@/modules/ui/components/Button';
import { Container } from '@/modules/ui/components/Container';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import { LoadError, SetupNotice } from '@/modules/ui/components/PortalState';

export const metadata = { title: 'Forms' };

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
          items={[{ label: 'Knowledge base', href: '/' }, { label: 'Forms' }]}
        />

        <h1 className="mt-6 text-[30px] font-semibold tracking-[-0.02em] text-ink sm:text-[34px]">Forms</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Fill in a ready-made form here to send details to the support team.
        </p>

        <div className="mt-8">
          {forms.state === 'unconfigured' ? (
            <SetupNotice missing={forms.missing} />
          ) : forms.state === 'error' ? (
            <LoadError title="Could not load the forms" message={forms.message} />
          ) : forms.data.length ? (
            <FormList forms={forms.data} />
          ) : (
            <EmptyState
              icon="clipboard"
              title="No forms yet"
              description="Tag a form with the portal tag under Frontline → Forms and it appears here."
              action={
                <ButtonLink href="/tickets/new" size="sm">
                  Submit a ticket
                </ButtonLink>
              }
            />
          )}
        </div>
      </Container>
    </>
  );
}
