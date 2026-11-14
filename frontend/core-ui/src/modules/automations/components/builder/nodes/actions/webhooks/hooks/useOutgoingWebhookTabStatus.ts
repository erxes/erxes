import { TOutgoingWebhookForm } from '@/automations/components/builder/nodes/actions/webhooks/states/outgoingWebhookFormSchema';
import { Control, FieldErrors, FieldPath, useWatch } from 'react-hook-form';

const isFilled = (value: unknown) => {
  if (Array.isArray(value)) {
    return !!value.length;
  }

  if (value && typeof value === 'object') {
    return !!Object.keys(value).length;
  }

  return !!value;
};

/** A webhook tab's marker: an error wins, otherwise a dot once it is filled. */
export const useOutgoingWebhookTabStatus = ({
  control,
  fields,
  formErrors,
}: {
  control: Control<TOutgoingWebhookForm>;
  fields: Array<FieldPath<TOutgoingWebhookForm>>;
  formErrors: FieldErrors<TOutgoingWebhookForm>;
}) => {
  const values = useWatch<TOutgoingWebhookForm>({ control, name: fields });

  const hasErrors = fields.some(
    (field) => formErrors[field as keyof typeof formErrors],
  );
  const filled = fields.every((_, index) => isFilled(values[index]));

  if (hasErrors) {
    return 'error';
  }

  return filled ? 'filled' : 'empty';
};
