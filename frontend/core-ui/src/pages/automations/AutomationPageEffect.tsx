import { AutomationsHotKeyScope, AutomationsPath } from '@/automations/types';
import {
  useIsMatchingLocation,
  useQueryState,
  useSetHotkeyScope,
} from 'erxes-ui';
import { useEffect } from 'react';

export const AutomationsPageEffect = () => {
  const [activeTab] = useQueryState<'builder' | 'history'>('activeTab');
  const isMatchingLocation = useIsMatchingLocation(AutomationsPath.Index);
  const setHotkeyScope = useSetHotkeyScope();

  useEffect(() => {
    switch (true) {
      case isMatchingLocation(''): {
        setHotkeyScope(AutomationsHotKeyScope.AutomationsPage);
        break;
      }
      case isMatchingLocation(AutomationsPath.Create): {
        setHotkeyScope(AutomationsHotKeyScope.AutomationCreatePage);
        break;
      }
      case isMatchingLocation(AutomationsPath.Detail): {
        if (activeTab === 'history') {
          setHotkeyScope(AutomationsHotKeyScope.HistoriesFilter);
          break;
        }

        setHotkeyScope(AutomationsHotKeyScope.Builder);
        // setHotkeyScope(AutomationsHotKeyScope.BuilderPanel);
        break;
      }
    }
  }, [isMatchingLocation, setHotkeyScope]);

  return <></>;
};
