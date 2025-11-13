import { Button, InfoCard, Label } from 'erxes-ui';
import { SelectUOM } from 'ui-modules';
import { useState } from 'react';
import { IconPlus } from '@tabler/icons-react';

export const ProductDetailUom = () => {
  const [uom, setUom] = useState<string>('');
  return (
    <InfoCard
      title="UOM"
      description="choose the unit of measure for the product"
    >
      <InfoCard.Content>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>UOM</Label>
            <SelectUOM value={uom} onValueChange={setUom} />
          </div>
          <div className="space-y-2">
            <Label>Sub UOMs</Label>
            <div className="grid grid-cols-2 gap-1"></div>
            <Button variant="secondary">
              <IconPlus />
              Add Sub UOM
            </Button>
          </div>
        </div>
      </InfoCard.Content>
    </InfoCard>
  );
};
