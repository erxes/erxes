import type { ApolloError } from '@apollo/client';
import {
  IconAlertTriangle,
  IconLock,
  IconMessageOff,
  IconShieldLock,
} from '@tabler/icons-react';
import { Button, Empty } from 'erxes-ui';
import { accessProblem, type AccessProblem } from '../utils';

const COPY: Record<
  AccessProblem,
  { icon: typeof IconLock; title: string; description: string }
> = {
  forbidden: {
    icon: IconLock,
    title: 'Permission required',
    description:
      'Reading private conversations requires an explicit grant, including for owners. In Settings → Team Member → Permission groups, assign Communication Messaging Viewer. A custom group can also grant Communication → Messaging → View all conversations.',
  },
  audit: {
    icon: IconShieldLock,
    title: 'Access could not be recorded',
    description:
      'Conversation access is only shown once it is recorded in the system log. Try again shortly.',
  },
  notFound: {
    icon: IconMessageOff,
    title: 'Conversation not found',
    description:
      'It does not exist in an app that belongs to your organization.',
  },
  failed: {
    icon: IconAlertTriangle,
    title: 'Something went wrong',
    description: 'The conversation data could not be loaded.',
  },
};

export const AccessState = ({
  error,
  onRetry,
}: {
  error: ApolloError;
  onRetry?: () => void;
}) => {
  const problem = accessProblem(error);
  const { icon: Icon, title, description } = COPY[problem];
  return (
    <Empty className="py-12">
      <Empty.Header>
        <Empty.Media variant="icon">
          <Icon />
        </Empty.Media>
        <Empty.Title>{title}</Empty.Title>
        <Empty.Description>{description}</Empty.Description>
      </Empty.Header>
      {onRetry && problem !== 'forbidden' && problem !== 'notFound' && (
        <Empty.Content>
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        </Empty.Content>
      )}
    </Empty>
  );
};
