import { IconPlus } from '@tabler/icons-react';
import { Button, Editor, InfoCard, Input, Label } from 'erxes-ui';
import { useState } from 'react';

export const ProductDetailBarcode = () => {
  const [barcodeDescription, setBarcodeDescription] = useState<string>('');

  return (
    <>
      <InfoCard title="Barcodes">
        <InfoCard.Content>
          <div className="space-y-2">
            <Label>Barcode Description</Label>
            <Editor
              isHTML={true}
              initialContent={barcodeDescription}
              onChange={setBarcodeDescription}
            />
          </div>
          <div className="space-y-2">
            <Label>Barcodes</Label>
            <Input />
            <Button variant="secondary">
              <IconPlus />
              Add Barcode
            </Button>
          </div>
        </InfoCard.Content>
      </InfoCard>
    </>
  );
};
