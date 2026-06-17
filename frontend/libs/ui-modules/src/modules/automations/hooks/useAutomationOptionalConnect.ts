import { useMemo } from 'react';
import { AutomationOptionalConnectHandle } from 'ui-modules/modules/automations/components/AutomationOptionalConnect';

export const useAutomationOptionalConnect = ({
  id,
  isAvailableOptionalConnect = true,
  flowDirection = 'horizontal',
}: {
  id: string;
  isAvailableOptionalConnect?: boolean;
  flowDirection?: 'horizontal' | 'vertical';
}) => {
  const OptionConnectHandle = useMemo(
    () =>
      AutomationOptionalConnectHandle(
        id,
        isAvailableOptionalConnect,
        flowDirection,
      ),
    [id, isAvailableOptionalConnect, flowDirection],
  );

  return OptionConnectHandle;
};
