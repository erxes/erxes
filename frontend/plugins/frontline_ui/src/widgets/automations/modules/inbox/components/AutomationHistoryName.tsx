import { IconExternalLink } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import {
  AutomationExecutionHistoryNameProps,
  splitAutomationNodeType,
} from 'ui-modules';

type TInboxHistoryTarget = {
  _id?: string;
  conversationId?: string;
  customerId?: string;
};

export const AutomationHistoryName = ({
  triggerType,
  target,
}: AutomationExecutionHistoryNameProps<TInboxHistoryTarget>) => {
  const { t } = useTranslation('frontline');
  const [, , collectionType] = splitAutomationNodeType(triggerType);

  const conversationId =
    collectionType === 'conversations' ? target?._id : target?.conversationId;
  const customerId = target?.customerId;

  if (!customerId && !conversationId) {
    return <span>{t('no-data')}</span>;
  }

  return (
    <>
      {!!customerId && (
        <Button asChild variant="link">
          <Link
            target="_blank"
            to={`/contacts/customers?contactId=${customerId}`}
          >
            {t('customer')}
            <IconExternalLink />
          </Link>
        </Button>
      )}
      {!!customerId && !!conversationId && `\u00A0/\u00A0`}
      {!!conversationId && (
        <Button asChild variant="link">
          <Link
            target="_blank"
            to={`/frontline/inbox?conversationId=${conversationId}`}
          >
            {t('go-to-conversation')}
            <IconExternalLink />
          </Link>
        </Button>
      )}
    </>
  );
};
