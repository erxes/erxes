import { Button, InfoCard, Label } from 'erxes-ui';
import { SelectUOM } from 'ui-modules';
import { useState } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

export const ProductDetailUom = () => {
  const [uom, setUom] = useState<string>('');
  const { t } = useTranslation('product', {
    keyPrefix: 'detail',
  });
  return (
    <InfoCard
      title={t('uom')}
      description={t('uom-description')}
    >
      <InfoCard.Content>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('uom')}</Label>
            <SelectUOM value={uom} onValueChange={setUom} />
          </div>
          <div className="space-y-2">
            <Label>{t('sub-uom')}</Label>
            <div className="grid grid-cols-2 gap-1"></div>
            <Button variant="secondary">
              <IconPlus />
              {t('add-sub-uom')}
            </Button>
          </div>
        </div>
      </InfoCard.Content>
    </InfoCard>
  );
};
