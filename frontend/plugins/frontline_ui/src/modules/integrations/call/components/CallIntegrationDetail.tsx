import { CellContext } from '@tanstack/react-table';
import { IIntegrationDetail } from '@/integrations/types/Integration';
import { Switch, Tooltip } from 'erxes-ui';
import { IconEdit } from '@tabler/icons-react';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { callEditSheetAtom } from '@/integrations/call/states/callEditSheetAtom';
import { CallIntegrationSheetEdit } from '@/integrations/call/components/CallIntegrationEdit';
import { CallIntegrationAddSheet } from '@/integrations/call/components/CallIntegrationAdd';
import { useCallUserIntegration } from '@/integrations/call/hooks/useCallUserIntegration';
import { useCallEnabledIntegrations } from '@/integrations/call/hooks/useCallEnabledIntegrations';

export const CallIntegrationDetail = () => {
  return (
    <div>
      <CallIntegrationAddSheet />
      <CallIntegrationSheetEdit />
    </div>
  );
};

export const CallIntegrationActions = ({
  cell,
}: {
  cell: CellContext<IIntegrationDetail, unknown>;
}) => {
  const { t } = useTranslation('frontline');
  const setEditId = useSetAtom(callEditSheetAtom);

  return (
    <>
      <CallIntegrationConnect integrationId={cell.row.original._id} />
      <div
        onClick={() => setEditId(cell.row.original._id)}
        className="flex items-center gap-2 w-full"
      >
        <IconEdit size={16} />
        {t('edit')}
      </div>
    </>
  );
};

export const CallIntegrationConnect = ({
  integrationId,
}: {
  integrationId: string;
}) => {
  const { t } = useTranslation('frontline');
  const { callUserIntegrations } = useCallUserIntegration();
  const { isEnabled, toggleIntegration } = useCallEnabledIntegrations();

  const integration = callUserIntegrations?.find(
    (integration) => integration.inboxId === integrationId,
  );

  if (!integration) {
    return null;
  }

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Switch
            checked={isEnabled(integrationId)}
            onCheckedChange={(checked) =>
              toggleIntegration(integration, checked)
            }
          />
        </Tooltip.Trigger>
        <Tooltip.Content>{t('connect-to-call')}</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};
