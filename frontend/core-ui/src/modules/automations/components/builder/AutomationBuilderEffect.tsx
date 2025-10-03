import { useResetNodes } from '@/automations/hooks/useResetNodes';
import { useTriggersActions } from '@/automations/hooks/useTriggersActions';
import { useEffect } from 'react';

export const AutomationBuilderEffect = () => {
  const { triggers, actions } = useTriggersActions();
  const { resetNodes } = useResetNodes();

  useEffect(() => {
    resetNodes();
  }, [JSON.stringify(triggers), JSON.stringify(actions)]);

  return <></>;
};
