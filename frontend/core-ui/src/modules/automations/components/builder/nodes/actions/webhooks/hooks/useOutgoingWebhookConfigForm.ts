import { OUTGOING_WEBHOOK_FORM_DEFAULT_VALUES } from '@/automations/components/builder/nodes/actions/webhooks/constants/outgoingWebhookForm';
import {
  outgoingWebhookFormSchema,
  TOutgoingWebhookForm,
} from '@/automations/components/builder/nodes/actions/webhooks/states/outgoingWebhookFormSchema';
import { normalizeOutgoingWebhookBodyValue } from '@/automations/components/builder/nodes/actions/webhooks/utils/outgoingWebhookBodyBuilder';
import { zodResolver } from '@hookform/resolvers/zod';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { merge } from 'lodash';
import { useCallback, useMemo } from 'react';
import { SubmitHandler, useForm, useWatch } from 'react-hook-form';
import { TAutomationAction, useFormValidationErrorHandler } from 'ui-modules';

type TBodyMode = NonNullable<TOutgoingWebhookForm['bodyMode']>;

/** The tabs of the webhook form and the fields each one reports as filled. */
export const OUTGOING_WEBHOOK_TABS: {
  value: string;
  labelKey: string;
  fields: (keyof TOutgoingWebhookForm)[];
}[] = [
  {
    value: 'request',
    labelKey: 'request',
    fields: ['method', 'url', 'queryParams'],
  },
  { value: 'body', labelKey: 'body', fields: ['body'] },
  { value: 'auth', labelKey: 'auth', fields: ['auth'] },
  { value: 'header', labelKey: 'headers', fields: ['headers'] },
  { value: 'options', labelKey: 'options', fields: ['options'] },
];

const defaultValuesOf = (config?: Record<string, unknown>) => {
  const merged = merge({}, OUTGOING_WEBHOOK_FORM_DEFAULT_VALUES, config || {});

  merged.body = normalizeOutgoingWebhookBodyValue(merged.body, merged.bodyMode);

  return merged;
};

// Switching mode swaps an untouched body for the other mode's empty body
const emptyBodyFor = (mode: TBodyMode, body: string) => {
  if (mode === 'text' && body.trim() === '{}') {
    return '';
  }

  if (mode === 'json' && !body.trim()) {
    return '{}';
  }

  return null;
};

/** The outgoing webhook form: defaults merged in, and the body's mode. */
export const useOutgoingWebhookConfigForm = ({
  currentAction,
  handleSave,
}: {
  currentAction: TAutomationAction;
  handleSave: SubmitHandler<TOutgoingWebhookForm>;
}) => {
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Webhook Configuration',
  });
  const defaultValues = useMemo(
    () => defaultValuesOf(currentAction?.config),
    [currentAction?.config],
  );
  const form = useForm<TOutgoingWebhookForm>({
    resolver: zodResolver(outgoingWebhookFormSchema),
    defaultValues,
  });
  const bodyMode = useWatch({ control: form.control, name: 'bodyMode' });

  const onBodyModeChange = useCallback(
    (mode: TBodyMode) => {
      form.setValue('bodyMode', mode, { shouldDirty: true });

      const nextBody = emptyBodyFor(mode, form.getValues('body'));

      if (nextBody !== null) {
        form.setValue('body', nextBody, { shouldDirty: true });
      }
    },
    [form],
  );

  return {
    form,
    bodyMode: bodyMode || 'json',
    onBodyModeChange,
    onSave: form.handleSubmit(handleSave, handleValidationErrors),
  };
};
