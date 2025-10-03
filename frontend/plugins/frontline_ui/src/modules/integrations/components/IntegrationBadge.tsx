import { IconMail } from '@tabler/icons-react';
import { INTEGRATION_ICONS } from '../constants/integrationImages';
import { useIntegrationInline } from '../hooks/useIntegrations';
import { Badge } from 'erxes-ui';

export const ConversationIntegrationBadge = ({
  integrationId,
}: {
  integrationId?: string;
}) => {
  const { integration } = useIntegrationInline({
    variables: {
      _id: integrationId,
    },
    skip: !integrationId,
  });
  const { kind } = integration || {};

  const Icon =
    INTEGRATION_ICONS[kind as keyof typeof INTEGRATION_ICONS] ?? IconMail;

  return (
    <Badge className="absolute -bottom-1 -right-1 size-4 rounded-full bg-background flex justify-center items-center p-0 text-primary">
      <Icon className="size-4 flex-none text-primary" />
    </Badge>
  );
};
