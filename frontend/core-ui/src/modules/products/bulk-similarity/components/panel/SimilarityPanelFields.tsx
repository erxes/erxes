import {
  IconAlignLeft,
  IconBarcode,
  IconBuilding,
  IconCategory,
  IconCoin,
  IconCurrencyDollar,
  IconHash,
  IconLabel,
  IconPackage,
  IconRuler,
  IconShoppingCart,
  IconTag,
} from '@tabler/icons-react';
import {
  cn,
  Editor,
  NumberField,
  ScrollArea,
  Select,
  TextField,
} from 'erxes-ui';
import {
  type FieldPath,
  type PathValue,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  PANEL_TEXT_FIELD_CLASS_NAME,
  PanelField,
  SelectBrand,
  SelectCategory,
} from 'ui-modules';
import { PRODUCT_TYPES } from 'ui-modules/modules/products/constants/productTypes';
import { ContactDetailSection } from '@/side-panel/components/details/ContactDetailSection';
import { ProductNameField } from '@/products/product-detail/components/panel/ProductNameField';
import {
  EmptyHint,
  FieldError,
  PANEL_SELECT_TRIGGER_CLASS_NAME,
  PanelCurrencyField,
  PanelVendorField,
  toSingleId,
} from '@/products/product-detail/components/panel/ProductPanelCells';
import { ProductUomField } from '@/products/product-detail/components/panel/ProductUomField';
import { BulkSimilarityFormValues } from '../../constants/bulkSimilaritySchema';

const SCOPE = 'side-panel-similarity';

// A rich-text value across the panel's width, written to the form as it is
// typed: Save may come before the editor is left.
const SimilarityEditorField = ({
  label,
  icon: Icon,
  value,
  scope,
  onChange,
}: {
  label: string;
  icon: typeof IconAlignLeft;
  value: string;
  scope: string;
  onChange: (value: string) => void;
}) => (
  <div className="flex flex-col gap-1.5 pt-2">
    <span className="flex items-center gap-1.5 text-xs font-medium text-accent-foreground">
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      {label}
    </span>
    <Editor
      initialContent={value}
      onChange={onChange}
      scope={scope}
      className="h-auto min-h-20 rounded-sm shadow-none hover:bg-accent focus-within:bg-background focus-within:shadow-focus"
    />
  </div>
);

/**
 * The Details tab: the group's shared product info as panel cells. A cell
 * writes to the form, not the group: the group's products are generated
 * from it on Save.
 */
export const SimilarityPanelFields = ({ draft }: { draft?: boolean }) => {
  const { t } = useTranslation('product', { keyPrefix: 'bulk-similarity' });
  const { t: detailT } = useTranslation('product', { keyPrefix: 'detail' });
  const { control, setValue, formState } =
    useFormContext<BulkSimilarityFormValues>();
  const values = useWatch({ control });
  const errors = formState.errors;

  const set = <TName extends FieldPath<BulkSimilarityFormValues>>(
    name: TName,
    value: PathValue<BulkSimilarityFormValues, TName>,
  ) => setValue(name, value, { shouldDirty: true, shouldValidate: true });

  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <div className="flex min-w-0 flex-col gap-5 p-3">
        <ContactDetailSection title={t('general')} nested>
          <PanelField icon={IconPackage} label={t('name')} cell={false}>
            <ProductNameField
              value={values.name || ''}
              placeholder={detailT('enter-name')}
              autoFocus={draft}
              onSave={(name) => set('name', name)}
            />
          </PanelField>
          <FieldError message={errors.name?.message} />
          <PanelField icon={IconHash} label={t('code')}>
            <TextField
              scope={`${SCOPE}.code`}
              value={values.code || ''}
              placeholder={detailT('enter-code', 'Enter code')}
              className={cn(
                PANEL_TEXT_FIELD_CLASS_NAME,
                !values.code && 'text-accent-foreground',
              )}
              onSave={(code) => set('code', code.trim())}
            />
          </PanelField>
          <FieldError message={errors.code?.message} />
          <PanelField icon={IconCategory} label={t('category')}>
            <SelectCategory.InlineCell
              scope={`${SCOPE}.category`}
              value={values.categoryId || ''}
              placeholder={detailT('choose-category', 'Choose category')}
              onValueChange={(value) => {
                const categoryId = toSingleId(value);
                if (categoryId) set('categoryId', categoryId);
              }}
            />
          </PanelField>
          <FieldError message={errors.categoryId?.message} />
          <PanelField icon={IconShoppingCart} label={t('type')}>
            <Select
              value={values.type || ''}
              onValueChange={(type) => set('type', type)}
            >
              <Select.Trigger className={PANEL_SELECT_TRIGGER_CLASS_NAME}>
                <Select.Value
                  placeholder={detailT('select-type', 'Select type')}
                />
              </Select.Trigger>
              <Select.Content align="start">
                {PRODUCT_TYPES.map((type) => (
                  <Select.Item key={type.value} value={type.value}>
                    {type.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
          </PanelField>
          <PanelField icon={IconLabel} label={t('short-name')}>
            <TextField
              scope={`${SCOPE}.shortName`}
              value={values.shortName || ''}
              placeholder={detailT('enter-short-name', 'Enter short name')}
              className={cn(
                PANEL_TEXT_FIELD_CLASS_NAME,
                !values.shortName && 'text-accent-foreground',
              )}
              onSave={(shortName) => set('shortName', shortName)}
            />
          </PanelField>
        </ContactDetailSection>
        <ContactDetailSection title={detailT('pricing', 'Pricing')} nested>
          <PanelField icon={IconCurrencyDollar} label={t('unit-price')}>
            <NumberField
              scope={`${SCOPE}.unitPrice`}
              value={Number(values.unitPrice) || 0}
              className={PANEL_TEXT_FIELD_CLASS_NAME}
              onSave={(unitPrice) => set('unitPrice', unitPrice)}
            />
          </PanelField>
          <FieldError message={errors.unitPrice?.message} />
          <PanelField icon={IconCoin} label={t('currency')}>
            <PanelCurrencyField
              scope={`${SCOPE}.currency`}
              value={values.currency || ''}
              placeholder={detailT('select-currency', 'Select currency')}
              onChange={(currency) => set('currency', currency)}
            />
          </PanelField>
          <PanelField icon={IconRuler} label={t('uom')}>
            <ProductUomField
              scope={`${SCOPE}.uom`}
              value={values.uom || ''}
              placeholder={detailT('select-uom', 'Select UOM')}
              onChange={(uom) => set('uom', uom)}
            />
          </PanelField>
          <FieldError message={errors.uom?.message} />
        </ContactDetailSection>
        <ContactDetailSection title={detailT('more-info')} nested>
          <PanelField icon={IconTag} label={t('brands')}>
            <SelectBrand.InlineCell
              mode="multiple"
              scope={`${SCOPE}.brands`}
              value={values.scopeBrandIds || []}
              onValueChange={(value) =>
                set('scopeBrandIds', Array.isArray(value) ? value : [value])
              }
            />
            {!values.scopeBrandIds?.length && (
              <EmptyHint>{detailT('select-brands', 'Select brands')}</EmptyHint>
            )}
          </PanelField>
          <PanelField icon={IconBuilding} label={t('vendor')}>
            <PanelVendorField
              scope={`${SCOPE}.vendor`}
              value={values.vendorId || ''}
              placeholder={detailT('select-vendor', 'Select vendor')}
              onChange={(vendorId) => set('vendorId', vendorId)}
            />
          </PanelField>
          <SimilarityEditorField
            label={t('barcode-description')}
            icon={IconBarcode}
            value={values.barcodeDescription || ''}
            scope={`${SCOPE}.barcodeDescription`}
            onChange={(value) => set('barcodeDescription', value)}
          />
          <SimilarityEditorField
            label={t('description')}
            icon={IconAlignLeft}
            value={values.description || ''}
            scope={`${SCOPE}.description`}
            onChange={(value) => set('description', value)}
          />
        </ContactDetailSection>
      </div>
    </ScrollArea>
  );
};
