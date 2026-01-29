import { CurrencyField, Editor, InfoCard, Input, Label } from 'erxes-ui';
import { IProductDetail, SelectCategory, SelectProductType } from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export const ProductDetailGeneral = ({
  name,
  code,
  shortName,
  categoryId,
  // currency,
  unitPrice,
  type,
  description: initialDescription,
}: IProductDetail) => {
  const [description, setDescription] = useState<string>(
    initialDescription || '',
  );
  const { t } = useTranslation('product', {
    keyPrefix: 'detail',
  });
  return (
    <InfoCard title={t('product-information')}>
      <InfoCard.Content>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('name')}</Label>
            <Input value={name} />
          </div>
          <div className="space-y-2">
            <Label>{t('code')}</Label>
            <Input value={code} />
          </div>
          <div className="space-y-2">
            <Label>{t('short-name')}</Label>
            <Input value={shortName} />
          </div>
          <div className="space-y-2">
            <Label>{t('type')}</Label>
            <SelectProductType value={type} onValueChange={() => null} />
          </div>
          <div className="space-y-2">
            <Label>{t('category')}</Label>
            <SelectCategory selected={categoryId} onSelect={() => null} />
          </div>
          {/* <div className="col-start-1 space-y-2">
            <Label>{t('currency')}</Label>
            <CurrencyField.SelectCurrency
              value={currency}
              onChange={() => null}
            />
          </div> */}
          <div className="space-y-2">
            <Label>{t('unit-price')}</Label>
            <CurrencyField.ValueInput value={unitPrice} onChange={() => null} />
          </div>
          <div className="col-span-2 space-y-2">
            <Label>{t('description')}</Label>
            <Editor
              initialContent={description}
              className="h-auto"
              onChange={setDescription}
            />
          </div>
        </div>
      </InfoCard.Content>
    </InfoCard>
  );
};
