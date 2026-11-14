import { IconExternalLink } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router';
import { AutomationExecutionHistoryNameProps } from 'ui-modules';

export const InstagramAutomationHistoryName = ({
  target,
}: AutomationExecutionHistoryNameProps) => {
  const { t } = useTranslation('frontline', { keyPrefix: 'modules.instagram' });
  return (
    <>
      <Button asChild variant="link">
        <Link target="_blank" to={`/contacts/details/${target?.customerId}`}>
          {t('see-customer')}
          <IconExternalLink />
        </Link>
      </Button>
      {/* The inbox opens a conversation by its own id; older runs lack it */}
      {target?.erxesApiId && (
        <>
          {`\u00A0/\u00A0`}
          <Button asChild variant="link">
            <Link
              target="_blank"
              to={`/frontline/inbox?conversationId=${target.erxesApiId}`}
            >
              {t('see-conversation')}
              <IconExternalLink />
            </Link>
          </Button>
        </>
      )}
    </>
  );
};
