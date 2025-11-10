import { ActionResultComponentProps } from '@/automations/components/builder/nodes/types/coreAutomationActionTypes';
import { IconEye } from '@tabler/icons-react';
import { Button, Dialog } from 'erxes-ui';
import ReactJson from 'react-json-view';

export const OutgoinWebhookActionResponse = ({
  result,
  action,
}: ActionResultComponentProps) => {
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button variant="ghost">
          <IconEye /> See Response
        </Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <ReactJson src={result || {}} collapsed={1} name={false} />
      </Dialog.Content>
    </Dialog>
  );
};
