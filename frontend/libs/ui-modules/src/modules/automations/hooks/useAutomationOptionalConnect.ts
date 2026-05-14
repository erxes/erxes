import { useMemo } from 'react';
import { AutomationOptionalConnectHandle } from 'ui-modules/modules/automations/components/AutomationOptionalConnect';

export const useAutomationOptionalConnect = ({
  id,
  isAvailableOptionalConnect = true,
}: {
  id: string;
  isAvailableOptionalConnect?: boolean;
}) => {
  const OptionConnectHandle = useMemo(
    () => AutomationOptionalConnectHandle(id, isAvailableOptionalConnect),
    [id, isAvailableOptionalConnect],
  );

  return OptionConnectHandle;
};
