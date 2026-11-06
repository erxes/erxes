import { ProductFormValues } from '@/products/constants/ProductFormSchema';
import { PRODUCT_TYPE_OPTIONS } from '@/products/constants/ProductConstants';
import {
  PRODUCT_PANEL_SELECT_CLASS_NAME,
  ProductPanelNumberField,
  ProductPanelPlaceholder,
  ProductPanelSelectField,
  ProductPanelTextField,
} from './ProductPanelField';
import {
  IconAlignLeft,
  IconCategory,
  IconCheck,
  IconClock,
  IconClockHour4,
  IconCurrencyDollar,
  IconHash,
  IconPackage,
  IconRulerMeasure,
  IconTag,
  IconWeight,
} from '@tabler/icons-react';
import {
  Button,
  Editor,
  Form,
  PopoverScoped,
  RecordTableInlineCell,
} from 'erxes-ui';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  PanelField,
  PanelFieldTrigger,
  SelectCategory,
  SelectUOMWithName,
} from 'ui-modules';

export const ProductPanelGeneralFields = ({
  productId,
  codeDisabled,
  suggestedCode,
  durationTypes,
}: {
  productId: string;
  codeDisabled: boolean;
  suggestedCode: string;
  durationTypes: readonly { label: string; value: string }[];
}) => {
  const { t } = useTranslation('product', { keyPrefix: 'detail' });
  const form = useFormContext<ProductFormValues>();
  const productType = form.watch('type');
  const code = form.watch('code');
  const [categoryOpen, setCategoryOpen] = useState(false);

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <ProductPanelTextField name="name" icon={IconPackage} label={t('name')} />
      <ProductPanelTextField
        name="shortName"
        icon={IconTag}
        label={t('short-name')}
      />
      <ProductPanelTextField
        name="code"
        icon={IconHash}
        label={t('code')}
        placeholder={suggestedCode || t('code')}
        disabled={codeDisabled}
        suffix={
          suggestedCode && !code && !codeDisabled ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-7 shrink-0"
              title={t('use-suggested-code', 'Use suggested code')}
              aria-label={t('use-suggested-code', 'Use suggested code')}
              onClick={() =>
                form.setValue('code', suggestedCode, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            >
              <IconCheck className="size-3.5" />
            </Button>
          ) : null
        }
      />
      <Form.Field
        control={form.control}
        name="categoryId"
        render={({ field }) => (
          <Form.Item className="space-y-0">
            <PanelField icon={IconCategory} label={t('category')}>
              <SelectCategory.Provider
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  setCategoryOpen(false);
                }}
              >
                <PopoverScoped
                  scope="product-panel.category"
                  open={categoryOpen}
                  onOpenChange={setCategoryOpen}
                >
                  <Form.Control>
                    <PanelFieldTrigger aria-label={t('category')}>
                      {field.value ? (
                        <SelectCategory.Value />
                      ) : (
                        <ProductPanelPlaceholder icon={IconCategory}>
                          {t('category')}
                        </ProductPanelPlaceholder>
                      )}
                    </PanelFieldTrigger>
                  </Form.Control>
                  <RecordTableInlineCell.Content>
                    <SelectCategory.Content />
                  </RecordTableInlineCell.Content>
                </PopoverScoped>
              </SelectCategory.Provider>
            </PanelField>
            <Form.Message className="pl-[7rem] text-xs" />
          </Form.Item>
        )}
      />
      <ProductPanelSelectField
        name="type"
        icon={IconPackage}
        label={t('type')}
        options={PRODUCT_TYPE_OPTIONS}
      />
      <ProductPanelNumberField
        name="unitPrice"
        icon={IconCurrencyDollar}
        label={t('unit-price')}
      />
      <ProductPanelNumberField
        name="weight"
        icon={IconWeight}
        label={t('weight', 'Weight')}
      />
      {productType === 'unique' && (
        <>
          <ProductPanelNumberField
            name="duration"
            icon={IconClock}
            label={t('duration')}
          />
          <ProductPanelSelectField
            name="durationType"
            icon={IconClockHour4}
            label={t('duration-type')}
            options={durationTypes}
          />
        </>
      )}
      <Form.Field
        control={form.control}
        name="uom"
        render={({ field }) => (
          <Form.Item className="space-y-0">
            <PanelField
              icon={IconRulerMeasure}
              label={t('unit-of-measurements')}
            >
              <SelectUOMWithName
                key={field.value || 'empty'}
                value={field.value || ''}
                onValueChange={field.onChange}
                inForm
                className={PRODUCT_PANEL_SELECT_CLASS_NAME}
                placeholder={
                  <ProductPanelPlaceholder icon={IconRulerMeasure}>
                    {t('unit-of-measurements')}
                  </ProductPanelPlaceholder>
                }
              />
            </PanelField>
            <Form.Message className="pl-[7rem] text-xs" />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name="description"
        render={({ field }) => (
          <Form.Item className="space-y-1.5 pt-2">
            <Form.Label className="flex items-center gap-1.5 text-xs font-medium text-accent-foreground">
              <IconAlignLeft className="size-3.5 shrink-0" aria-hidden="true" />
              {t('description')}
            </Form.Label>
            <Editor
              key={productId}
              initialContent={field.value || ''}
              onChange={field.onChange}
              className="h-auto min-h-20 rounded-sm shadow-none"
            />
            <Form.Message className="text-xs" />
          </Form.Item>
        )}
      />
    </div>
  );
};
