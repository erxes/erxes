import { useSendEmailSidebarForm } from '@/automations/components/builder/nodes/actions/sendEmail/hooks/useSendEmailSidebarForm';
import { TAutomationSendEmailConfig } from '@/automations/components/builder/nodes/actions/sendEmail/states/sendEmailConfigForm';
import {
  IEmailSender,
  useSenderOptions,
} from '@/settings/mail-config/hooks/useVerifiedSenders';
import { renderEmailHtml } from 'erxes-ui';
import { useCallback, useRef } from 'react';
import {
  TAutomationAction,
  TPlaceholderInputSuggestion,
  useFormValidationErrorHandler,
} from 'ui-modules';

/** Address inputs offer record fields and team members, by email. */
export const EMAIL_ADDRESS_INPUT_PROPS = {
  disabled: [TPlaceholderInputSuggestion.Attribute],
  enabled: [
    TPlaceholderInputSuggestion.Attribute,
    TPlaceholderInputSuggestion.CallUser,
  ],
  suggestionsOptions: {
    call_user: {
      selectFieldName: 'email',
      formatSelection: (value: string) => value,
    },
  },
};

// The sending address shown under the name, as the recipient will see it
const fromPreviewOf = (name: string | undefined, alignedFrom: string) =>
  name ? `${name} <${alignedFrom}>` : `<${alignedFrom}>`;

/**
 * The send email form: sender options, filling the sender name from a picked
 * address, and rendering the email's html once more on save.
 */
export const useSendEmailConfigForm = ({
  currentActionIndex,
  currentAction,
  handleSave,
}: {
  currentActionIndex: number;
  currentAction: TAutomationAction<TAutomationSendEmailConfig>;
  handleSave: (config: TAutomationSendEmailConfig) => void;
}) => {
  const { handleValidationErrors } = useFormValidationErrorHandler({
    formName: 'Send email Configuration',
  });
  const { form, contentType, availableVariableSourceNodes } =
    useSendEmailSidebarForm(currentActionIndex, currentAction);
  const {
    supportsSenderVerification,
    defaultSenderEmail,
    alignedFrom,
    loading: senderOptionsLoading,
  } = useSenderOptions();
  const senderName = form.watch('sender');
  // What the last pick wrote, so another pick updates a name this field put
  // there while never overwriting one that was typed
  const autoFilledSender = useRef('');

  const handleSenderSelected = useCallback(
    (sender?: IEmailSender) => {
      const name = sender?.name?.trim();
      const current = form.getValues('sender')?.trim();

      if (!name || (current && current !== autoFilledSender.current)) {
        return;
      }

      autoFilledSender.current = name;
      form.setValue('sender', name, {
        shouldDirty: true,
        shouldValidate: true,
      });
    },
    [form],
  );

  // The html beside the editor's source renders asynchronously, so it is
  // rendered once more here rather than trusting whichever render landed last
  const handleSubmit = useCallback(
    async (values: TAutomationSendEmailConfig) => {
      if (values.contentFormat !== 'maily' || !values.contentJson) {
        return handleSave(values);
      }

      return handleSave({
        ...values,
        content: await renderEmailHtml(values.contentJson),
      });
    },
    [handleSave],
  );

  return {
    form,
    contentType: contentType || '',
    availableVariableSourceNodes,
    supportsSenderVerification,
    defaultSenderEmail,
    senderOptionsLoading,
    // An aligned address replaces the reply-to field and the sender choice
    replyToFieldName: alignedFrom ? 'fromEmailPlaceHolder' : 'replyToEmail',
    replyToFieldKey: alignedFrom ? 'aligned' : 'plain',
    fromPreview: alignedFrom ? fromPreviewOf(senderName, alignedFrom) : null,
    showSenderType: !senderOptionsLoading && !alignedFrom,
    handleSenderSelected,
    onSave: form.handleSubmit(handleSubmit, handleValidationErrors),
  } as const;
};
