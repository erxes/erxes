import { CurrencyCode, CurrencyField, InfoCard, Label } from 'erxes-ui';
import { SelectBrand } from 'ui-modules/modules/brands';
import { SelectCompany } from 'ui-modules/modules/contacts';
import { useTranslation } from 'react-i18next';

interface ProductDetailInfoProps {
  scopeBrandIds?: string[];
  vendorId?: string;
  currency?: string;
}

export function ProductDetailInfo({
  scopeBrandIds,
  vendorId,
  currency,
}: ProductDetailInfoProps) {
  const { t } = useTranslation('product', { keyPrefix: 'detail' });

  return (
    <InfoCard title={t('more-info')}>
      <InfoCard.Content>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>{t('brand')}</Label>
            <SelectBrand
              value={scopeBrandIds || []}
              onValueChange={() => null}
              mode="multiple"
            />
          </div>
          <div className="space-y-2">
            <Label>{t('vendor')}</Label>
            <SelectCompany value={vendorId} onValueChange={() => null} />
          </div>
          <div className="space-y-2">
            <Label>{t('currency')}</Label>
            <CurrencyField.SelectCurrency
              value={currency as CurrencyCode}
              onChange={() => null}
              className="w-full"
            />
          </div>
        </div>
      </InfoCard.Content>
    </InfoCard>
  );
}
