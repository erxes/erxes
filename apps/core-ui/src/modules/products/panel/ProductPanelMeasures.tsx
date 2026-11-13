import type { Product } from '@erxes/core-contract';
import { IconCoin, IconCurrencyDollar, IconRulerMeasure, IconWeight } from '@tabler/icons-react';
import { cn, NumberField, useToast } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { CurrencySelect } from '~/components/RegionSelect';
import { fromAmountInput, toAmountInput, useMoney } from '~/lib/money';
import { PANEL_TEXT_FIELD_CLASS_NAME, PanelField } from '~/modules/side-panel/PanelField';
import { PANEL_PICKER_CLASS_NAME, PRODUCT_PANEL_SCOPE } from './ProductPanelFields';
import { useProductEdit } from './useProductEdit';

/**
 * Price as people read it (in the currency's units), and its currency. A new
 * currency keeps the amount people see: 12.50 USD becomes 12.50 EUR.
 */
export const ProductPriceRows = ({ product }: { product: Product }) => {
  const { t } = useTranslation('product');
  const { toast } = useToast();
  const money = useMoney();
  const edit = useProductEdit();
  const { id, price, currency } = product;

  const savePrice = (amount: number) => {
    if (amount < 0) {
      toast({
        variant: 'destructive',
        title: t('form.price-invalid', 'Enter a price, like 12.50'),
      });

      return;
    }

    const next = fromAmountInput(String(amount), currency);

    if (next !== price) edit.mutate({ id, price: next });
  };

  return (
    <>
      <PanelField icon={IconCurrencyDollar} label={t('fields.price', 'Price')}>
        <NumberField
          scope={`${PRODUCT_PANEL_SCOPE}.${id}.price`}
          value={Number(toAmountInput(price, currency))}
          formatValue={() => money(price, currency)}
          className={PANEL_TEXT_FIELD_CLASS_NAME}
          onSave={savePrice}
        />
      </PanelField>
      <PanelField icon={IconCoin} label={t('fields.currency', 'Currency')}>
        <CurrencySelect
          value={currency}
          className={PANEL_PICKER_CLASS_NAME}
          onChange={(next) => {
            if (next === currency) return;
            edit.mutate({
              id,
              currency: next,
              price: fromAmountInput(toAmountInput(price, currency), next),
            });
          }}
        />
      </PanelField>
    </>
  );
};

type TSizeCode = 'weightGrams' | 'lengthMm' | 'widthMm' | 'heightMm';

/** A whole number of grams or millimetres; empty (or 0) clears it. */
const ProductSizeRow = ({
  product,
  code,
  label,
}: {
  product: Product;
  code: TSizeCode;
  label: string;
}) => {
  const edit = useProductEdit();
  const value = product[code];
  const Icon = code === 'weightGrams' ? IconWeight : IconRulerMeasure;

  return (
    <PanelField icon={Icon} label={label}>
      <NumberField
        scope={`${PRODUCT_PANEL_SCOPE}.${product.id}.${code}`}
        value={value ?? 0}
        formatValue={(next) => (value === null ? label : next.toLocaleString())}
        className={cn(PANEL_TEXT_FIELD_CLASS_NAME, value === null && 'text-muted-foreground')}
        onSave={(next) => {
          const size = next > 0 ? Math.round(next) : null;

          if (size !== value) edit.mutate({ id: product.id, [code]: size });
        }}
      >
        {value === null && (
          <Icon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
      </NumberField>
    </PanelField>
  );
};

/** Weight and size, for goods (shipping and storage plugins read them). */
export const ProductSizeRows = ({ product }: { product: Product }) => {
  const { t } = useTranslation('product');

  return (
    <>
      <ProductSizeRow
        product={product}
        code="weightGrams"
        label={t('fields.weight', 'Weight (g)')}
      />
      <ProductSizeRow product={product} code="lengthMm" label={t('fields.length', 'Length (mm)')} />
      <ProductSizeRow product={product} code="widthMm" label={t('fields.width', 'Width (mm)')} />
      <ProductSizeRow product={product} code="heightMm" label={t('fields.height', 'Height (mm)')} />
    </>
  );
};
