import { useTranslation } from 'react-i18next';
import { AutomationActionFormProps } from 'ui-modules';
import {
  MailReplyActionForm,
  TMailReplyActionForm,
} from './MailReplyActionForm';

export const MailDraftActionForm = (
  props: AutomationActionFormProps<TMailReplyActionForm>,
) => {
  const { t } = useTranslation('frontline');

  return (
    <MailReplyActionForm
      {...props}
      copy={{
        formName: t('mail-action-draft-form-name', 'Draft Email Reply Action'),
        contentDescription: t(
          'mail-action-draft-content-description',
          "Insert an AI Agent output variable to draft the agent's answer. The draft waits in the conversation until a teammate sends, edits or deletes it.",
        ),
        resolveDescription: t(
          'mail-action-draft-resolve-description',
          'Close the conversation once a teammate sends the draft.',
        ),
      }}
    />
  );
};
