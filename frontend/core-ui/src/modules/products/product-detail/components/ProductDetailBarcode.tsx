import { IconPlus } from '@tabler/icons-react';
import { Button, Editor, InfoCard, Input, Label } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export const ProductDetailBarcode = () => {
  const [barcodeDescription, setBarcodeDescription] = useState<string>('');
  const { t } = useTranslation('product', {
    keyPrefix: 'detail',
  });

  return (
    <>
      <InfoCard title={t('barcodes')}>
        <InfoCard.Content>
          <div className="space-y-2">
            <Label>{t('barcode-description')}</Label>
            <Editor
              isHTML={true}
              initialContent={barcodeDescription}
              onChange={setBarcodeDescription}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('barcodes')}</Label>
            <Input />
            <Button variant="secondary">
              <IconPlus />
              {t('add-barcode')}
            </Button>
          </div>
        </InfoCard.Content>
      </InfoCard>
    </>
  );
};
