import { CurrencyField, Editor, InfoCard, Input, Label } from 'erxes-ui';
import { IProductDetail, SelectCategory, SelectProductType } from 'ui-modules';
import { atomWithStorage } from 'jotai/utils';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';

const descriptionAtom = atomWithStorage<string | undefined>(
  'description',
  undefined,
  undefined,
  {
    getOnInit: true,
  },
);

export const ProductDetailGeneral = ({
  name,
  code,
  shortName,
  categoryId,
  currency,
  unitPrice,
  type,
}: IProductDetail) => {
  const [description, setDescription] = useAtom<string | undefined>(
    descriptionAtom,
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
          <div className="space-y-2 col-start-1">
            <Label>{t('currency')}</Label>
            <CurrencyField.SelectCurrency
              value={currency}
              onChange={() => null}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('unit-price')}</Label>
            <CurrencyField.ValueInput value={unitPrice} onChange={() => null} />
          </div>
          <div className="space-y-2 col-span-2">
            <Label>{t('description')}</Label>
            <Editor
              isHTML={true}
              initialContent={description}
              className="h-auto"
              onChange={(value) => setDescription(value)}
            />
          </div>
        </div>
      </InfoCard.Content>
    </InfoCard>
  );
};
