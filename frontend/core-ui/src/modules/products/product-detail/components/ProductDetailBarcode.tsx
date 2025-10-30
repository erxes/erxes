import { Editor, InfoCard, Label } from 'erxes-ui';
import { useState } from 'react';

export const ProductDetailBarcode = () => {
  const [barcodeDescription, setBarcodeDescription] = useState<string>('');
  console.log(barcodeDescription);
  return (
    <>
      <InfoCard title="Barcodes">
        <InfoCard.Content>
          <div className="space-y-2">
            <Label>Barcode</Label>
            <Editor
              isHTML={true}
              initialContent={barcodeDescription}
              onChange={setBarcodeDescription}
            />
          </div>
        </InfoCard.Content>
      </InfoCard>
    </>
  );
};
