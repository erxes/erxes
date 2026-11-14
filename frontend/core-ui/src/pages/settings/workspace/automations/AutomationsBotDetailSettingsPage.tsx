import { AutomationBotDetailSettings } from '@/automations/components/settings/components/bots/components/AutomationBotIntegrationDetailSettings';
import { useParams } from 'react-router';
import { useEffect } from 'react';
import { useSidePanel } from 'ui-modules';
import { getModulePanelPath } from '@/side-panel/states/modulePanelState';

const LEGACY_BOTS_PANEL = getModulePanelPath(
  'automations/settings/bots/AutomationBotDetailSettingsPage',
);

export const AutomationBotDetailSettingsPage = () => {
  const { type } = useParams();
  const panel = useSidePanel();
  useEffect(() => {
    if (panel.path === LEGACY_BOTS_PANEL) {
      panel.dismissPath(LEGACY_BOTS_PANEL);
    }
  }, [panel]);

  if (!type) {
    return null;
  }

  return <AutomationBotDetailSettings botType={type} />;
};
