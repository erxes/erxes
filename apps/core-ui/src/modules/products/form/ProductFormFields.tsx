import { Form, Textarea, ToggleGroup } from 'erxes-ui';
import { useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { CurrencySelect } from '~/components/RegionSelect';
import { amountStep } from '~/lib/money';
import { CategoryPicker } from '../categories/CategoryPicker';
import { productHref } from '../paths';
import type { ProductFieldError } from './productErrors';
import type { ProductFormValues } from './productFormValues';
import { ProductTextField } from './ProductTextField';

/** "Open it" under a code or barcode another product already has. */
const ExistingProductLink = ({
  error,
  field,
}: {
  error: ProductFieldError | null;
  field: string;
}) => {
  const { t } = useTranslation('product');

  if (error?.field !== field || !error.productId) return null;

  return (
    <Link to={productHref(error.productId)} className="text-sm text-primary hover:underline">
      {t('form.open-existing', 'Open that product')}
    </Link>
  );
};

const KindField = () => {
  const { t } = useTranslation('product');
  const { control } = useFormContext<ProductFormValues>();

  return (
    <Form.Field
      control={control}
      name="kind"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('fields.kind', 'Kind')}</Form.Label>
          <Form.Control>
            <ToggleGroup
              type="single"
              variant="outline"
              value={field.value}
              onValueChange={(next) => {
                if (next === 'goods' || next === 'service') field.onChange(next);
              }}
              className="w-full"
            >
              <ToggleGroup.Item value="goods" className="flex-1">
                {t('kind.goods', 'Goods')}
              </ToggleGroup.Item>
              <ToggleGroup.Item value="service" className="flex-1">
                {t('kind.service', 'Service')}
              </ToggleGroup.Item>
            </ToggleGroup>
          </Form.Control>
        </Form.Item>
      )}
    />
  );
};

const CategoryField = () => {
  const { t } = useTranslation('product');
  const { control } = useFormContext<ProductFormValues>();

  return (
    <Form.Field
      control={control}
      name="categoryId"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('fields.category', 'Category')}</Form.Label>
          <Form.Control>
            <CategoryPicker
              value={field.value}
              onChange={field.onChange}
              noneLabel={t('category.none', 'No category')}
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

/** Price as people type it, in the product's currency (the organisation's unless changed). */
const PriceFields = () => {
  const { t } = useTranslation('product');
  const { control } = useFormContext<ProductFormValues>();
  const currency = useWatch({ control, name: 'currency' });

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_8rem_6rem] gap-3">
      <ProductTextField
        name="price"
        label={t('fields.price', 'Price')}
        type="number"
        min={0}
        step={amountStep(currency)}
        placeholder="0"
        inputMode="decimal"
      />
      <Form.Field
        control={control}
        name="currency"
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{t('fields.currency', 'Currency')}</Form.Label>
            <Form.Control>
              <CurrencySelect value={field.value} onChange={field.onChange} />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <ProductTextField name="unit" label={t('fields.unit', 'Unit')} placeholder="pcs" />
    </div>
  );
};

const DescriptionField = () => {
  const { t } = useTranslation('product');
  const { control } = useFormContext<ProductFormValues>();

  return (
    <Form.Field
      control={control}
      name="description"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('fields.description', 'Description')}</Form.Label>
          <Form.Control>
            <Textarea rows={3} {...field} />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

/** Weight and size, for goods (shipping and storage plugins read them). */
const SizeFields = () => {
  const { t } = useTranslation('product');

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <ProductTextField
        name="weightGrams"
        label={t('fields.weight', 'Weight (g)')}
        inputMode="numeric"
      />
      <ProductTextField
        name="lengthMm"
        label={t('fields.length', 'Length (mm)')}
        inputMode="numeric"
      />
      <ProductTextField
        name="widthMm"
        label={t('fields.width', 'Width (mm)')}
        inputMode="numeric"
      />
      <ProductTextField
        name="heightMm"
        label={t('fields.height', 'Height (mm)')}
        inputMode="numeric"
      />
    </div>
  );
};

/** The product's own fields: what it is, its codes, category, price and size. */
export const ProductFormFields = ({ saveError }: { saveError: ProductFieldError | null }) => {
  const { t } = useTranslation('product');
  const kind = useWatch<ProductFormValues, 'kind'>({ name: 'kind' });

  return (
    <>
      <KindField />
      <ProductTextField name="name" label={t('fields.name', 'Name')} />
      <div className="grid grid-cols-2 gap-3">
        <ProductTextField
          name="code"
          label={t('fields.code', 'Code')}
          after={<ExistingProductLink error={saveError} field="code" />}
        />
        <ProductTextField
          name="barcode"
          label={t('fields.barcode', 'Barcode')}
          after={<ExistingProductLink error={saveError} field="barcode" />}
        />
      </div>
      <CategoryField />
      <PriceFields />
      <DescriptionField />
      {kind === 'goods' && <SizeFields />}
    </>
  );
};
