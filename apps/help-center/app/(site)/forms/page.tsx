import { getPortalForms } from '@/modules/forms/api';
import { FormList } from '@/modules/forms/components/FormList';
import { PortalShell } from '@/modules/layout/components/PortalShell';
import { CountBadge } from '@/modules/ui/components/PageHeader';
import { ButtonLink } from '@/modules/ui/components/Button';
import { EmptyState } from '@/modules/ui/components/EmptyState';
import {
  LoadError,
  SetupNotice,
  Unpublished,
} from '@/modules/ui/components/PortalState';

export const metadata = { title: 'Forms' };

export default async function FormsPage() {
  const forms = await getPortalForms();

  return (
    <PortalShell
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Forms' }]}
      title="Forms"
      description="Fill in a ready-made form here to send details to the support team."
      meta={
        forms.state === 'ready' && forms.data.length ? (
          <CountBadge count={forms.data.length} label="forms" />
        ) : null
      }
    >
      {forms.state === 'unconfigured' ? (
        <SetupNotice missing={forms.missing} />
      ) : forms.state === 'unpublished' ? (
        <Unpublished domain={forms.domain} />
      ) : forms.state === 'error' ? (
        <LoadError title="Could not load the forms" message={forms.message} />
      ) : forms.data.length ? (
        <FormList forms={forms.data} />
      ) : (
        <EmptyState
          icon="clipboard"
          title="No forms yet"
          description="Choose a form channel for this help center under Frontline → Help Center and its forms appear here."
          action={
            <ButtonLink href="/tickets/new" size="sm">
              Submit a ticket
            </ButtonLink>
          }
        />
      )}
    </PortalShell>
  );
}
