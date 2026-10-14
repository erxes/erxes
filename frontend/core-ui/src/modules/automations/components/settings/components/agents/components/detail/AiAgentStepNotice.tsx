import { TAiAgentStep } from '@/automations/components/settings/components/agents/constants/aiAgentSteps';
import { useAiAgentDetailContext } from '@/automations/components/settings/components/agents/context/AiAgentDetailContext';
import { IconAlertTriangle, IconBulb, IconCircleX } from '@tabler/icons-react';
import { Alert } from 'erxes-ui';

const NOTICE_VARIANTS = {
  hint: { variant: 'default', icon: IconBulb },
  warning: { variant: 'warning', icon: IconAlertTriangle },
  error: { variant: 'destructive', icon: IconCircleX },
} as const;

/** The step's own issue, said where it can be fixed. */
export const AiAgentStepNotice = ({ step }: { step: TAiAgentStep }) => {
  const { states } = useAiAgentDetailContext();
  const { status, message, detail } = states[step];

  if (status !== 'hint' && status !== 'warning' && status !== 'error') {
    return null;
  }

  const { variant, icon: Icon } = NOTICE_VARIANTS[status];

  return (
    <Alert variant={variant}>
      <Icon />
      <Alert.Description>{detail || message}</Alert.Description>
    </Alert>
  );
};
