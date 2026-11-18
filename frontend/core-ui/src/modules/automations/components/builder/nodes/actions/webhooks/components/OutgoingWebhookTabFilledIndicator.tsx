import { useOutgoingWebhookTabStatus } from '@/automations/components/builder/nodes/actions/webhooks/hooks/useOutgoingWebhookTabStatus';
import { TOutgoingWebhookForm } from '@/automations/components/builder/nodes/actions/webhooks/states/outgoingWebhookFormSchema';
import { IconInfoTriangle } from '@tabler/icons-react';
import { Control, FieldErrors, FieldPath } from 'react-hook-form';

export const OutgoingWebhookTabFilledIndicator = (props: {
  control: Control<TOutgoingWebhookForm>;
  fields: Array<FieldPath<TOutgoingWebhookForm>>;
  formErrors: FieldErrors<TOutgoingWebhookForm>;
}) => {
  const status = useOutgoingWebhookTabStatus(props);

  if (status === 'error') {
    return <IconInfoTriangle className="ml-2  size-3 text-destructive" />;
  }

  if (status === 'filled') {
    return <div className="ml-2 size-1 bg-primary rounded-full" />;
  }

  return null;
};
