import { InfoCard, Input, Label, ToggleGroup } from 'erxes-ui';
import { IClientPortal } from '../types/clientPortal';

export const ClientPortalDetailAuth = ({
  clientPortal,
}: {
  clientPortal: IClientPortal;
}) => {
  return (
    <InfoCard title="Authentication">
      <InfoCard.Content className="gap-4">
        <div className="flex flex-col gap-2">
          <Label>Token Pass Method</Label>
          <div>
            <ToggleGroup
              type="single"
              variant="outline"
              defaultValue="bearer-token"
              className="inline-flex"
            >
              <ToggleGroup.Item value="bearer-token">
                Bearer Token
              </ToggleGroup.Item>

              <ToggleGroup.Item value="cookie">
                <div className="absolute inset-0 h-full flex items-center justify-center">
                  Cookie
                </div>
                <div className="opacity-0">Bearer Token</div>
              </ToggleGroup.Item>
            </ToggleGroup>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <Label>Token expiration duration</Label>
            <Input type="number" defaultValue={1} />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Refresh Token expiration duration</Label>
            <Input type="number" defaultValue={1} />
          </div>
        </div>
      </InfoCard.Content>
    </InfoCard>
  );
};
