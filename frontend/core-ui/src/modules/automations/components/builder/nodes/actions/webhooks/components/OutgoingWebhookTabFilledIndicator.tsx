import { TOutgoingWebhookForm } from '@/automations/components/builder/nodes/actions/webhooks/states/outgoingWebhookFormSchema';
import { IconInfoTriangle } from '@tabler/icons-react';
import { Control, FieldErrors, FieldPath, useWatch } from 'react-hook-form';

export const OutgoingWebhookTabFilledIndicator = ({
  control,
  fields,
  formErrors,
}: {
  control: Control<TOutgoingWebhookForm>;
  fields: Array<FieldPath<TOutgoingWebhookForm>>;
  formErrors: FieldErrors<TOutgoingWebhookForm>;
}) => {
  const values = useWatch<TOutgoingWebhookForm>({
    control: control,
    name: fields,
  });

  const filled = fields.every((_, index) => {
    const value = values[index];
    if (Array.isArray(value)) {
      return !!value.length;
    }

    if (value && typeof value === 'object') {
      return !!Object.keys(value).length;
    }

    return !!values[index];
  });

  // Check if any of the fields have errors
  const hasErrors = fields.some(
    (field) => formErrors[field as keyof typeof formErrors],
  );

  if (!filled && !hasErrors) {
    return null;
  }

  if (hasErrors) {
    return <IconInfoTriangle className="ml-2  size-3 text-destructive" />;
  }
  // Show red indicator if there are errors, otherwise show primary color

  return <div className="ml-2 size-1 bg-primary rounded-full" />;
};
