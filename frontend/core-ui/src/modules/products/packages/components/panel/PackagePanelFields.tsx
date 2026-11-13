import {
  IconAlignLeft,
  IconCircleCheck,
  IconCurrencyDollar,
  IconPackage,
  IconPercentage,
  IconReceipt,
  IconTags,
} from '@tabler/icons-react';
import { cn, NumberField, ScrollArea, Select, Textarea } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  PANEL_TEXT_FIELD_CLASS_NAME,
  PanelField,
  TagsSelect,
} from 'ui-modules';
import { ContactDetailSection } from '@/side-panel/components/details/ContactDetailSection';
import { ProductNameField } from '@/products/product-detail/components/panel/ProductNameField';
import {
  EmptyHint,
  FieldError,
  PANEL_SELECT_TRIGGER_CLASS_NAME,
} from '@/products/product-detail/components/panel/ProductPanelCells';
import { TPackagePatch } from '../../hooks/usePackagePanelSave';
import { IPackage, PACKAGE_STATUS_OPTIONS } from '../../types/Package';
import { percentFromPrice, priceFromPercent } from '../../utils/packagePricing';

const SCOPE = 'side-panel-package';

export type TPackagePanelProps = {
  pkg: IPackage;
  // The products' total at their unit prices, which the discount is off.
  total: number | null;
  // Resolves the saved package, or `null` when it was not saved.
  save: (patch: TPackagePatch) => Promise<IPackage | null>;
  // A package not created yet: changes stay in the draft until Create.
  draft?: boolean;
  // What Create found wrong, by field.
  errors?: Partial<Record<string, string>>;
};

const formatAmount = (value?: number | null) =>
  value == null
    ? ''
    : new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
        value,
      );

// The package's description as plain text, as the package stores it. Saved
// when left; Escape puts the saved one back.
const PackageDescriptionField = ({
  value,
  placeholder,
  onSave,
}: {
  value: string;
  placeholder: string;
  onSave: (description: string) => void;
}) => {
  const [description, setDescription] = useState(value);

  useEffect(() => setDescription(value), [value]);

  return (
    <Textarea
      value={description}
      rows={3}
      placeholder={placeholder}
      className="field-sizing-content min-h-16 resize-none rounded-sm px-2 py-1.5 text-xs shadow-none hover:bg-accent focus-visible:bg-background md:text-xs placeholder:text-accent-foreground"
      onChange={(event) => setDescription(event.target.value)}
      onBlur={() => description !== value && onSave(description)}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          setDescription(value);
        }
      }}
    />
  );
};

/**
 * The Details tab: the package's fields as panel cells, each saved on its
 * own. The discount and the price follow each other off the products'
 * total, as they did in the package form.
 */
export const PackagePanelFields = ({
  pkg,
  total,
  save,
  draft = false,
  errors,
}: TPackagePanelProps) => {
  const { t } = useTranslation('product', { keyPrefix: 'package' });
  const status = pkg.status || 'active';
  const knownStatus = PACKAGE_STATUS_OPTIONS.some(
    (option) => option.value === status,
  );

  const changePercent = (value: number) => {
    const percent = value || null;
    void save(
      total
        ? { percent, price: priceFromPercent(total, percent) }
        : { percent },
    );
  };

  const changePrice = (price: number) => {
    void save(
      total ? { price, percent: percentFromPrice(total, price) } : { price },
    );
  };

  return (
    <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
      <div className="flex min-w-0 flex-col gap-5 p-3">
        <ContactDetailSection title={t('basic-information')} nested>
          <PanelField icon={IconPackage} label={t('name')} cell={false}>
            <ProductNameField
              value={pkg.name || ''}
              placeholder={t('enter-name', 'Enter name')}
              autoFocus={draft}
              onSave={(name) => save({ name })}
            />
          </PanelField>
          <FieldError message={errors?.name} />
          <PanelField icon={IconCircleCheck} label={t('status')}>
            <Select
              value={status}
              onValueChange={(next) =>
                next !== status && save({ status: next })
              }
            >
              <Select.Trigger className={PANEL_SELECT_TRIGGER_CLASS_NAME}>
                <Select.Value placeholder={t('select-status')} />
              </Select.Trigger>
              <Select.Content align="start">
                {PACKAGE_STATUS_OPTIONS.map((option) => (
                  <Select.Item key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </Select.Item>
                ))}
                {/* A deleted package is archived; it is not chosen here. */}
                {!knownStatus && (
                  <Select.Item value={status} disabled>
                    {t(`status-${status}`, status)}
                  </Select.Item>
                )}
              </Select.Content>
            </Select>
          </PanelField>
          <PanelField icon={IconTags} label={t('tags')} cell={false}>
            <TagsSelect.InlineCell
              type="core:product"
              mode="multiple"
              scope={`${SCOPE}.tags`}
              value={pkg.tagIds || []}
              onValueChange={(value) =>
                save({
                  tagIds: Array.isArray(value) ? value : value ? [value] : [],
                })
              }
            />
            {!pkg.tagIds?.length && (
              <EmptyHint>{t('add-tags', 'Add tags')}</EmptyHint>
            )}
          </PanelField>
          <div className="flex min-w-0 flex-col gap-1 py-1">
            <span className="flex items-center gap-1.5 text-xs font-medium text-accent-foreground">
              <IconAlignLeft className="size-3.5 shrink-0" aria-hidden="true" />
              {t('description')}
            </span>
            <PackageDescriptionField
              value={pkg.description || ''}
              placeholder={t('enter-description', 'Enter description')}
              onSave={(description) => save({ description })}
            />
          </div>
        </ContactDetailSection>
        <ContactDetailSection title={t('pricing')} nested>
          <PanelField icon={IconReceipt} label={t('total-price')}>
            <span
              className={cn(
                'flex h-7 items-center px-2 tabular-nums',
                !total && 'text-accent-foreground',
              )}
            >
              {total
                ? formatAmount(total)
                : t('total-from-products', 'Choose products')}
            </span>
          </PanelField>
          <PanelField icon={IconPercentage} label={t('percent')}>
            <NumberField
              scope={`${SCOPE}.percent`}
              value={pkg.percent ?? 0}
              formatValue={(percent) => (percent ? `${percent}%` : '')}
              className={PANEL_TEXT_FIELD_CLASS_NAME}
              onSave={(percent) =>
                percent >= 0 && percent <= 100 && changePercent(percent)
              }
            />
            {!pkg.percent && (
              <EmptyHint>{t('enter-percent', 'No discount')}</EmptyHint>
            )}
          </PanelField>
          <FieldError message={errors?.percent} />
          <PanelField icon={IconCurrencyDollar} label={t('price')}>
            <NumberField
              scope={`${SCOPE}.price`}
              value={pkg.price ?? 0}
              formatValue={(price) =>
                pkg.price == null ? '' : formatAmount(price)
              }
              className={PANEL_TEXT_FIELD_CLASS_NAME}
              onSave={(price) => price >= 0 && changePrice(price)}
            />
            {pkg.price == null && (
              <EmptyHint>{t('enter-price', 'Enter price')}</EmptyHint>
            )}
          </PanelField>
          <FieldError message={errors?.price} />
        </ContactDetailSection>
      </div>
    </ScrollArea>
  );
};
