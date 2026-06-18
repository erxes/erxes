import {
  CurrencyField,
  Editor,
  Form,
  InfoCard,
  Input,
  Label,
  NumberInput,
  Select,
  Tooltip,
  useQueryState,
} from 'erxes-ui';
import {
  SelectCategory,
  SelectProductType,
  SelectUOMWithName,
} from 'ui-modules';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { ProductFormValues } from '@/products/constants/ProductFormSchema';
import { PRODUCT_QUERY_KEY } from '@/products/constants/productQueryKey';
import { PRODUCT_DURATION_TYPES } from 'ui-modules/modules/products/constants/productTypes';
import { useProductDetail } from '../hooks/useProductDetail';

export const ProductDetailGeneral = () => {
  const { t } = useTranslation('product', {
    keyPrefix: 'detail',
  });
  const form = useFormContext<ProductFormValues>();
  const [productId] = useQueryState<string>(PRODUCT_QUERY_KEY);
  const productType = form.watch('type');
  const { productDetail } = useProductDetail();

  return (
    <InfoCard title={t('product-information')}>
      <InfoCard.Content>
        <div className="grid grid-cols-2 gap-4">
          <Form.Field
            control={form.control}
            name="name"
            render={({ field }) => (
              <div className="space-y-2">
                <Label>{t('name')}</Label>
                <Input {...field} />
              </div>
            )}
          />
          <Form.Field
            control={form.control}
            name="code"
            render={({ field }) => (
              <div className="space-y-2">
                <Label>{t('code')}</Label>
                <Input {...field} disabled={!!productDetail?.similarityId} />
              </div>
            )}
          />
          <Form.Field
            control={form.control}
            name="shortName"
            render={({ field }) => (
              <div className="space-y-2">
                <Label>{t('short-name')}</Label>
                <Input {...field} />
              </div>
            )}
          />
          <Form.Field
            control={form.control}
            name="type"
            render={({ field }) => (
              <div className="space-y-2">
                <Label>{t('type')}</Label>
                <SelectProductType
                  value={field.value ?? ''}
                  onValueChange={field.onChange}
                  inForm
                />
              </div>
            )}
          />
          <Form.Field
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <div className="space-y-2">
                <Label>{t('category')}</Label>
                <SelectCategory
                  selected={field.value}
                  onSelect={field.onChange}
                />
              </div>
            )}
          />
          <Form.Field
            control={form.control}
            name="unitPrice"
            render={({ field }) => (
              <div className="space-y-2">
                <Label>{t('unit-price')}</Label>
                <CurrencyField.ValueInput
                  value={field.value}
                  onChange={(v) => field.onChange(v)}
                />
              </div>
            )}
          />
          {productType === 'unique' && (
            <>
              <Form.Field
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>{t('duration')}</Label>
                    <NumberInput {...field} />
                    <Form.Message />
                  </div>
                )}
              />
              <Form.Field
                control={form.control}
                name="durationType"
                render={({ field }) => (
                  <div className="space-y-2">
                    <Label>{t('duration-type')}</Label>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <Select.Trigger>
                        <Select.Value placeholder={t('select-duration-type')} />
                      </Select.Trigger>
                      <Select.Content>
                        {PRODUCT_DURATION_TYPES.map((durationType) => (
                          <Select.Item
                            key={durationType.value}
                            value={durationType.value}
                          >
                            {durationType.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select>
                    <Form.Message />
                  </div>
                )}
              />
            </>
          )}
          <Form.Field
            control={form.control}
            name="uom"
            render={({ field }) => {
              const uomValue =
                typeof field.value === 'string' ? field.value : '';

              return (
                <div className="col-span-2 space-y-2">
                  <Label>{t('unit-of-measurements')}</Label>
                  <SelectUOMWithName
                    key={uomValue || 'empty'}
                    value={uomValue}
                    onValueChange={(uomId: string) => {
                      field.onChange(uomId);
                    }}
                    inForm
                  />
                </div>
              );
            }}
          />
          <Form.Field
            control={form.control}
            name="description"
            render={({ field }) => (
              <div className="col-span-2 space-y-2">
                <Label>{t('description')}</Label>
                <Editor
                  key={productId || 'new-product'}
                  initialContent={field.value || ''}
                  className="h-auto"
                  onChange={field.onChange}
                />
              </div>
            )}
          />
        </div>
      </InfoCard.Content>
    </InfoCard>
  );
};
