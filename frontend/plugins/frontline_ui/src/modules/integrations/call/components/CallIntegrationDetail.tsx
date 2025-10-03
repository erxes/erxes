import { Cell } from '@tanstack/table-core';
import { IIntegrationDetail } from '@/integrations/types/Integration';
import { Button, Switch, Tooltip } from 'erxes-ui';
import { IconEdit } from '@tabler/icons-react';
import { useAtom, useSetAtom } from 'jotai';
import { callEditSheetAtom } from '@/integrations/call/states/callEditSheetAtom';
import { CallIntegrationSheetEdit } from '@/integrations/call/components/CallIntegrationEdit';
import { CallIntegrationAddSheet } from '@/integrations/call/components/CallIntegrationAdd';
import { useCallUserIntegration } from '@/integrations/call/hooks/useCallUserIntegration';
import { callConfigAtom } from '@/integrations/call/states/sipStates';

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
  cell: Cell<IIntegrationDetail, unknown>;
}) => {
  const setEditId = useSetAtom(callEditSheetAtom);

  return (
    <>
      <CallIntegrationConnect integrationId={cell.row.original._id} />
      <Button
        variant={'outline'}
        size="icon"
        onClick={() => setEditId(cell.row.original._id)}
      >
        <IconEdit />
      </Button>
    </>
  );
};

export const CallIntegrationConnect = ({
  integrationId,
}: {
  integrationId: string;
}) => {
  const [callConfig, setCallConfig] = useAtom(callConfigAtom);
  const { callUserIntegrations } = useCallUserIntegration();

  const integration = callUserIntegrations?.find(
    (integration) => integration.inboxId === integrationId,
  );

  if (!integration) {
    return null;
  }

  const handleChange = (checked: boolean) => {
    setCallConfig({
      ...integration,
      isAvailable: checked,
    });
  };

  return (
    <Tooltip.Provider>
      <Tooltip>
        <Tooltip.Trigger asChild>
          <Switch
            checked={
              callConfig?.inboxId === integrationId && callConfig.isAvailable
            }
            onCheckedChange={handleChange}
          />
        </Tooltip.Trigger>
        <Tooltip.Content>Connect to call</Tooltip.Content>
      </Tooltip>
    </Tooltip.Provider>
  );
};
