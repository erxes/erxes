import {
  CurrencyCode,
  CurrencyField,
  Editor,
  Form,
  InfoCard,
  Input,
} from 'erxes-ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectBrand } from 'ui-modules/modules/brands';
import { SelectCompany } from 'ui-modules/modules/contacts';
import { SelectProductType, SelectUOMWithName } from 'ui-modules';
import {
  ProductAttachmentItem,
  ProductPrimaryImageUpload,
  ProductSecondaryImagesUpload,
} from 'ui-modules/modules/products/components/ProductImageUploads';
import { SelectCategory } from '@/products/product-category/components/SelectCategory';
import { BulkSimilarityFormValues } from '../constants/bulkSimilaritySchema';

export const BulkBaseInfo = () => {
  const { t } = useTranslation('product', { keyPrefix: 'bulk-similarity' });
  const form = useFormContext<BulkSimilarityFormValues>();

  return (
    <div className="gap-4 grid lg:grid-cols-5">
      <InfoCard title={t('general', 'General')} className="lg:col-span-3">
        <InfoCard.Content>
          <div className="gap-4 grid sm:grid-cols-2">
            <Form.Field
              control={form.control}
              name="name"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>
                    {t('name', 'Name')}{' '}
                    <span className="text-destructive">*</span>
                  </Form.Label>
                  <Form.Control>
                    <Input {...field} value={field.value || ''} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="code"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>
                    {t('code', 'Code')}{' '}
                    <span className="text-destructive">*</span>
                  </Form.Label>
                  <Form.Control>
                    <Input {...field} value={field.value || ''} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="shortName"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('short-name', 'Short name')}</Form.Label>
                  <Form.Control>
                    <Input {...field} value={field.value || ''} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="type"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('type', 'Type')}</Form.Label>
                  <SelectProductType
                    value={field.value || ''}
                    onValueChange={field.onChange}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>
                    {t('category', 'Category')}{' '}
                    <span className="text-destructive">*</span>
                  </Form.Label>
                  <SelectCategory
                    selected={field.value}
                    onSelect={field.onChange}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="unitPrice"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>
                    {t('unit-price', 'Unit price')}{' '}
                    <span className="text-destructive">*</span>
                  </Form.Label>
                  <Form.Control>
                    <CurrencyField.ValueInput
                      value={field.value ?? 0}
                      onChange={field.onChange}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="uom"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>
                    {t('uom', 'UOM')} <span className="text-destructive">*</span>
                  </Form.Label>
                  <SelectUOMWithName
                    value={field.value || ''}
                    onValueChange={field.onChange}
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="vendorId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('vendor', 'Vendor')}</Form.Label>
                  <SelectCompany
                    value={field.value}
                    onValueChange={(vendorId) =>
                      field.onChange(vendorId as string)
                    }
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="currency"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('currency', 'Currency')}</Form.Label>
                  <CurrencyField.SelectCurrency
                    value={(field.value as CurrencyCode) ?? undefined}
                    onChange={field.onChange}
                    className="w-full"
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="scopeBrandIds"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('brands', 'Brands')}</Form.Label>
                  <SelectBrand
                    mode="multiple"
                    value={field.value || []}
                    onValueChange={(scopeBrandIds) =>
                      field.onChange(scopeBrandIds as string[])
                    }
                  />
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
        </InfoCard.Content>
      </InfoCard>

      <InfoCard title={t('additional', 'Additional')} className="lg:col-span-2">
        <InfoCard.Content className="flex flex-col flex-auto gap-4">
          <Form.Field
            control={form.control}
            name="barcodeDescription"
            render={({ field }) => (
              <Form.Item>
                <Form.Label>{t('barcode-description', 'Barcode description')}</Form.Label>
                <Editor
                  initialContent={field.value || ''}
                  onChange={field.onChange}
                  className="h-auto"
                />
                <Form.Message />
              </Form.Item>
            )}
          />
          <Form.Field
            control={form.control}
            name="description"
            render={({ field }) => (
              <Form.Item className="flex flex-col flex-auto">
                <Form.Label>{t('description', 'Description')}</Form.Label>
                <Editor
                  initialContent={field.value || ''}
                  onChange={field.onChange}
                  className="flex-auto h-auto"
                />
                <Form.Message />
              </Form.Item>
            )}
          />
        </InfoCard.Content>
      </InfoCard>

      <div className="items-stretch gap-4 grid grid-cols-1 md:grid-cols-3 lg:col-span-5">
        <InfoCard title={t('featured-image', 'Featured image')} className="md:col-span-1 h-full">
          <InfoCard.Content className="h-full">
            <Form.Field
              control={form.control}
              name="attachment"
              render={({ field }) => (
                <ProductPrimaryImageUpload
                  value={(field.value as ProductAttachmentItem) ?? null}
                  onChange={(value) => field.onChange(value ?? undefined)}
                />
              )}
            />
          </InfoCard.Content>
        </InfoCard>
        <InfoCard
          title={t('secondary-images', 'Secondary images')}
          className="md:col-span-2 min-w-0 h-full"
        >
          <InfoCard.Content className="min-w-0 h-full">
            <Form.Field
              control={form.control}
              name="attachmentMore"
              render={({ field }) => (
                <ProductSecondaryImagesUpload
                  value={(field.value as ProductAttachmentItem[]) ?? []}
                  onChange={field.onChange}
                />
              )}
            />
          </InfoCard.Content>
        </InfoCard>
      </div>
    </div>
  );
};
