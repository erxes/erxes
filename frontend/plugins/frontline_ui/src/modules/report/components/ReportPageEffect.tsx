import { useEffect } from 'react';
import { useIsMatchingLocation, useSetHotkeyScope } from 'erxes-ui';
import { FrontlinePaths } from '@/types/FrontlinePaths';
import { ReportHotKeyScope } from '@/report/types';

export const ReportPageEffect = () => {
  const isMatchingLocation = useIsMatchingLocation('/frontline');
  const setHotkeyScope = useSetHotkeyScope();
  useEffect(() => {
    if (isMatchingLocation(FrontlinePaths.Reports)) {
      setHotkeyScope(ReportHotKeyScope.ReportPage);
    }
  }, [isMatchingLocation, setHotkeyScope]);

  return null;
};
