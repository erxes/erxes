import { Button, Dialog, Input, Label, Select } from 'erxes-ui';
import { ICallConfig } from '@/integrations/call/types/callTypes';
import { useState } from 'react';
import { MembersInline } from 'ui-modules';
import { useAtom, useSetAtom } from 'jotai';
import { callConfigAtom } from '@/integrations/call/states/sipStates';
import { callSelectConfigDialogAtom } from '@/integrations/call/states/callSelectConfigDialogAtom';

export const CallSelectConfig = ({
  callUserIntegrations,
}: {
  callUserIntegrations: ICallConfig[];
}) => {
  const [open, setOpen] = useAtom(callSelectConfigDialogAtom);
  const [selectedIntegrationId, setSelectedIntegrationId] = useState(
    callUserIntegrations[0]?._id,
  );
  const setCallConfig = useSetAtom(callConfigAtom);
  const selectedIntegration = callUserIntegrations.find(
    (integration) => integration._id === selectedIntegrationId,
  );

  const handleSubmit = (isAvailable: boolean) => {
    if (!selectedIntegration) {
      return;
    }
    setCallConfig({ ...selectedIntegration, isAvailable });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Select a call config</Dialog.Title>
        </Dialog.Header>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Call config</Label>
            <Select
              value={selectedIntegrationId}
              onValueChange={setSelectedIntegrationId}
            >
              <Select.Trigger>
                <Select.Value placeholder="Select a call config" />
              </Select.Trigger>
              <Select.Content>
                <Select.Group>
                  <Select.Label>Call configs</Select.Label>
                  {callUserIntegrations.map((config) => (
                    <Select.Item key={config._id} value={config._id}>
                      {config.phone}
                    </Select.Item>
                  ))}
                </Select.Group>
              </Select.Content>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Queues</Label>
            <Input
              value={selectedIntegration?.queues.join(', ')}
              disabled
              readOnly
              placeholder="queues"
              className="disabled:opacity-90"
            />
          </div>
          <div className="space-y-2">
            <Label>Source trunk</Label>
            <Input
              value={selectedIntegration?.srcTrunk}
              disabled
              readOnly
              placeholder="srcTrunk"
              className="disabled:opacity-90"
            />
          </div>{' '}
          <div className="space-y-2">
            <Label>Destination trunk</Label>
            <Input
              value={selectedIntegration?.dstTrunk}
              disabled
              readOnly
              placeholder="dstTrunk"
              className="disabled:opacity-90"
            />
          </div>
          <div className="space-y-2">
            <Label>Operators</Label>
            {selectedIntegration?.operators.map((operator) => (
              <div key={operator.userId} className="flex items-center gap-2">
                <Button
                  variant="outline"
                  className="w-full h-8 shadow-xs disabled:opacity-90"
                  disabled
                >
                  <MembersInline memberIds={[operator.userId]} />
                </Button>
                <Input
                  value={operator.gsUsername}
                  disabled
                  readOnly
                  placeholder="gsUsername"
                  className="disabled:opacity-90"
                />
                <Input
                  value={operator.gsPassword}
                  disabled
                  readOnly
                  placeholder="gsPassword"
                  className="disabled:opacity-90"
                />
              </div>
            ))}
          </div>
        </div>
        <Dialog.Footer className="gap-0 pt-4">
          <Button
            onClick={() => setSelectedIntegrationId('')}
            variant="secondary"
            size="lg"
            className="mr-auto"
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleSubmit(false)}
            variant="secondary"
            size="lg"
          >
            Skip connection
          </Button>
          <Button onClick={() => handleSubmit(true)} size="lg">
            Save
          </Button>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  );
};
