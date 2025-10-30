import { IconPlus } from '@tabler/icons-react';
import { Button, InfoCard, Input, Label, Switch } from 'erxes-ui';

export function ProductsSettingGeneralPage() {
  return (
    <div className="flex flex-col gap-6">
      <InfoCard
        title="Product & Service settings"
        description="Manage the general settings for your product & service"
      >
        <InfoCard.Content>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch />
              <Label variant="peer">Require uoms</Label>
            </div>
          </div>
        </InfoCard.Content>
      </InfoCard>
      <InfoCard
        title="Uoms"
        description="Manage the uoms for your product & service"
      >
        <InfoCard.Content>
          <div className="flex gap-2 items-center">
            <Label className="min-w-24">Code</Label>
            <Label className="flex-auto">Name</Label>
            <Label>Action</Label>
          </div>
          <div>
            <Button variant="secondary">
              <IconPlus />
              Add Uom
            </Button>
          </div>
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
}
