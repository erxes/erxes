import { AutomationBotDetailSettings } from '@/automations/components/settings/components/bots/components/AutomationBotIntegrationDetailSettings';
import { AutomationSettingsPath } from '@/types/paths/AutomationPath';
import {
  createPagePanelPortal,
  usePagePanel,
} from '@/side-panel/hooks/usePagePanel';
import { RecordSidePanel } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams, useSearchParams } from 'react-router';

export const AutomationBotDetailSettingsPage = () => {
  const { type } = useParams();
  const { t } = useTranslation('automations');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const panel = usePagePanel({
    name: 'automations/settings/bots/AutomationBotDetailSettingsPage',
    identity: type,
    open: !!type,
    expandable: false,
    defaultWidth: 720,
    maxWidth: 1000,
    onOpenChange: (open) => {
      if (open) return;
      const params = new URLSearchParams(searchParams);
      params.delete('panel');
      params.delete('panelExpanded');
      const query = params.toString();
      const search = query ? `?${query}` : '';
      navigate(`${AutomationSettingsPath.Bots}${search}`);
    },
  });

  if (!type) {
    return null;
  }

  return createPagePanelPortal(
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-background">
      <RecordSidePanel.Header
        title={t('settings-bots-title')}
        {...panel.headerProps}
      />
      <div className="min-h-0 flex-1 overflow-y-auto p-5">
        <AutomationBotDetailSettings botType={type} />
      </div>
    </div>,
    panel,
  );
};
