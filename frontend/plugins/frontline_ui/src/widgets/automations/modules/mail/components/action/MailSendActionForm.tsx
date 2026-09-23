import { useTranslation } from 'react-i18next';
import { AutomationActionFormProps } from 'ui-modules';
import {
  MailReplyActionForm,
  TMailReplyActionForm,
} from './MailReplyActionForm';

export const MailSendActionForm = (
  props: AutomationActionFormProps<TMailReplyActionForm>,
) => {
  const { t } = useTranslation('frontline');

  return (
    <MailReplyActionForm
      {...props}
      copy={{
        formName: t('mail-action-send-form-name', 'Send Email Action'),
        contentDescription: t(
          'mail-action-send-content-description',
          "Insert an AI Agent output variable to reply with the agent's answer. The reply is sent right away, without review.",
        ),
        resolveDescription: t(
          'mail-action-send-resolve-description',
          'Close the conversation once the reply is sent.',
        ),
      }}
    />
  );
};
