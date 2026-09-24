import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPortalForm } from '@/modules/forms/api';
import { FormView } from '@/modules/forms/components/FormView';
import { formTitle } from '@/modules/forms/types';
import { PortalShell } from '@/modules/layout/components/PortalShell';
import {
  LoadError,
  SetupNotice,
  Unpublished,
} from '@/modules/ui/components/PortalState';

type Props = { params: Promise<{ formId: string }> };

export const generateMetadata = async ({
  params,
}: Props): Promise<Metadata> => {
  const { formId } = await params;
  const form = await getPortalForm(formId);

  return {
    title: form.state === 'ready' && form.data ? formTitle(form.data) : 'Form',
  };
};

export default async function FormPage({ params }: Props) {
  const { formId } = await params;
  const form = await getPortalForm(formId);

  if (form.state === 'ready' && !form.data) {
    notFound();
  }

  return (
    <PortalShell
      breadcrumbs={[
        { label: 'Home', href: '/' },
        { label: 'Forms', href: '/forms' },
        {
          label:
            form.state === 'ready' && form.data ? formTitle(form.data) : 'Form',
        },
      ]}
    >
      {form.state === 'unconfigured' ? (
        <div className="">
          <SetupNotice missing={form.missing} />
        </div>
      ) : form.state === 'unpublished' ? (
        <div className="">
          <Unpublished domain={form.domain} />
        </div>
      ) : form.state === 'error' ? (
        <div className="">
          <LoadError title="Could not load the form" message={form.message} />
        </div>
      ) : form.data ? (
        <div className="">
          <FormView form={form.data} />
        </div>
      ) : null}
    </PortalShell>
  );
}
