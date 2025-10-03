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
        <Link target="_blank" to={`/contacts/details/${target?.customerId}`}>
          {'See Customer'}
          <IconExternalLink />
        </Link>
      </Button>
      {`\u00A0/\u00A0`}
      <Button asChild variant="link">
        <Link
          target="_blank"
          to={`/frontline/inbox/index?_id=${target?.conversationId}`}
        >
          {'See Conversation'}
          <IconExternalLink />
        </Link>
      </Button>
    </>
  );
};
