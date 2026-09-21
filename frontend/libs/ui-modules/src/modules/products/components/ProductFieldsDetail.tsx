import {
  CurrencyField,
  Editor,
  Form,
  InfoCard,
  Input,
  NumberInput,
  Select,
} from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { SelectCategory } from '../categories';
import { PRODUCT_DURATION_TYPES } from '../constants/productTypes';
import { IProductFormValues } from '../types';
import { BarcodeManager, SubUomManager } from './ProductBarcodeAndUom';
import { SelectProductType } from './SelectProductType';
import { SelectUOMWithName } from './SelectUOMWithName';

export function AddProductFormFieldsDetail({
  form,
  showExtended = false,
}: {
  form: UseFormReturn<IProductFormValues>;
  showExtended?: boolean;
}) {
  const { t } = useTranslation('product', { keyPrefix: 'add' });
  const productType = form.watch('type');

  return (
    <div className={showExtended ? 'grid gap-4 lg:grid-cols-5' : ''}>
      <div className={showExtended ? 'grid gap-4 lg:col-span-3' : ''}>
        <InfoCard title={t('product-information')}>
          <InfoCard.Content>
            <div className="grid grid-cols-2 gap-4">
              <Form.Field
                control={form.control}
                name="name"
                render={({ field }) => (
                  <Form.Item>
                    <Form.Label>
                      {t('name')} <span className="text-destructive">*</span>
                    </Form.Label>
                    <Form.Control>
                      <Input {...field} />
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
                      {t('code')} <span className="text-destructive">*</span>
                    </Form.Label>
                    <Form.Control>
                      <Input {...field} />
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
                    <Form.Label>{t('short-name')}</Form.Label>
                    <Form.Control>
                      <Input {...field} />
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
                    <Form.Label>{t('type')}</Form.Label>
                    <SelectProductType
                      value={field.value}
                      onValueChange={field.onChange}
                      inForm
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
                      {t('category')}{' '}
                      <span className="text-destructive">*</span>
                    </Form.Label>
                    <Form.Control>
                      <SelectCategory
                        value={field.value}
                        onSelect={field.onChange}
                        mode="single"
                      />
                    </Form.Control>
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
                      {t('unit-price')}{' '}
                      <span className="text-destructive">*</span>
                    </Form.Label>
                    <Form.Control>
                      <CurrencyField.ValueInput
                        value={field.value}
                        onChange={(v) => field.onChange(v)}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
              {productType === 'unique' && (
                <>
                  <Form.Field
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('duration')}</Form.Label>
                        <Form.Control>
                          <NumberInput {...field} />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                  <Form.Field
                    control={form.control}
                    name="durationType"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>{t('duration-type')}</Form.Label>
                        <Form.Control>
                          <Select
                            value={field.value || ''}
                            onValueChange={field.onChange}
                          >
                            <Select.Trigger>
                              <Select.Value
                                placeholder={t('select-duration-type')}
                              />
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
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                </>
              )}
              <Form.Field
                control={form.control}
                name="uom"
                render={({ field }) => (
                  <Form.Item className="col-span-2">
                    <Form.Label>
                      {t('unit-of-measure')}{' '}
                      <span className="text-destructive">*</span>
                    </Form.Label>
                    <SelectUOMWithName
                      value={field.value || ''}
                      onValueChange={field.onChange}
                      inForm
                    />
                    <Form.Message />
                  </Form.Item>
                )}
              />

              <Form.Field
                control={form.control}
                name="description"
                render={({ field }) => (
                  <Form.Item className="col-span-2">
                    <Form.Label>{t('description')}</Form.Label>
                    <Form.Control>
                      <Editor
                        initialContent={field.value}
                        onChange={field.onChange}
                      />
                    </Form.Control>
                    <Form.Message />
                  </Form.Item>
                )}
              />
            </div>
          </InfoCard.Content>
        </InfoCard>
      </div>

      {showExtended && (
        <div className="grid gap-4 lg:col-span-2 lg:grid-cols-1">
          <InfoCard title={t('barcodes')}>
            <InfoCard.Content>
              <div className="flex flex-col gap-4 w-full">
                <BarcodeManager form={form} />

                <Form.Field
                  control={form.control}
                  name="barcodeDescription"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('barcode-description')}</Form.Label>
                      <Form.Control>
                        <Editor
                          initialContent={field.value}
                          onChange={field.onChange}
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              </div>
            </InfoCard.Content>
          </InfoCard>

          <InfoCard title={t('unit-of-measure')}>
            <InfoCard.Content>
              <SubUomManager form={form} />
            </InfoCard.Content>
          </InfoCard>
        </div>
      )}
    </div>
  );
}
