import { IconExternalLink } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { AutomationExecutionHistoryNameProps } from 'ui-modules';
import { useFormDetail } from '@/forms/hooks/useFormDetail';

type TFormHistoryTarget = {
  // groupId of the submission rows, the submissions page's submissionId
  _id?: string;
  formId?: string;
  customerId?: string;
  conversationId?: string | null;
};

export const FormHistoryName = ({
  target,
}: AutomationExecutionHistoryNameProps<TFormHistoryTarget>) => {
  const { t } = useTranslation('frontline');
  const formId = target?.formId || '';
  const { formDetail } = useFormDetail({ formId });

  if (!formId) {
    return <span>{t('no-data', 'No data')}</span>;
  }

  const submissionsLink = `/frontline/forms/submissions/${formId}${
    target?._id ? `?submissionId=${target._id}` : ''
  }`;

  const separator = ' / ';

  return (
    <>
      <Button asChild variant="link">
        <Link target="_blank" to={submissionsLink}>
          {formDetail?.name || formDetail?.title || t('form', 'Form')}
          <IconExternalLink />
        </Link>
      </Button>
      {!!target?.customerId && (
        <>
          {separator}
          <Button asChild variant="link">
            <Link
              target="_blank"
              to={`/contacts/customers?contactId=${target.customerId}`}
            >
              {t('customer', 'Customer')}
              <IconExternalLink />
            </Link>
          </Button>
        </>
      )}
      {!!target?.conversationId && (
        <>
          {separator}
          <Button asChild variant="link">
            <Link
              target="_blank"
              to={`/frontline/inbox?conversationId=${target.conversationId}`}
            >
              {t('go-to-conversation', 'Go to conversation')}
              <IconExternalLink />
            </Link>
          </Button>
        </>
      )}
    </>
  );
};
