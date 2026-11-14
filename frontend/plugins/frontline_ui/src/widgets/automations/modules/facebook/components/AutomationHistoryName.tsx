import { IconExternalLink } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { Link } from 'react-router';
import { AutomationExecutionHistoryNameProps } from 'ui-modules';

export const AutomationHistoryName = ({
  target,
}: AutomationExecutionHistoryNameProps) => {
  return (
    <>
      <Button asChild variant="link">
        <Link
          target="_blank"
          to={`/contacts/customers?contactId=${target?.customerId}`}
        >
          {'See Customer'}
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
              {'See Conversation'}
              <IconExternalLink />
            </Link>
          </Button>
        </>
      )}
    </>
  );
};
