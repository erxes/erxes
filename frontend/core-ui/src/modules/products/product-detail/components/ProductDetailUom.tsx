import { Button, InfoCard } from 'erxes-ui';
import { SubUomRow, type SubUomItem } from 'ui-modules';
import { IconPlus, IconRulerMeasure } from '@tabler/icons-react';
import { ProductPanelSection } from './ProductPanelSection';
import { useTranslation } from 'react-i18next';
import { useFormContext } from 'react-hook-form';
import { ProductFormValues } from '@/products/constants/ProductFormSchema';

export const ProductDetailUom = ({
  compact = false,
  disabled = false,
}: {
  compact?: boolean;
  disabled?: boolean;
}) => {
  const { t } = useTranslation('product', {
    keyPrefix: 'detail',
  });
  const form = useFormContext<ProductFormValues>();
  const subUoms = form.watch('subUoms') || [];

  const handleAddSubUom = () => {
    const newSubUom: SubUomItem = {
      _id: Math.random().toString(),
      uom: '',
      ratio: 1,
    };
    form.setValue('subUoms', [...subUoms, newSubUom]);
  };

  const handleRemoveSubUom = (index: number) => {
    const updated = subUoms.filter((_, i) => i !== index);
    form.setValue('subUoms', updated);
  };

  const handleUpdateSubUom = (
    index: number,
    fieldName: keyof SubUomItem,
    value: string | number,
  ) => {
    const updated: SubUomItem[] = subUoms.map((subUom, i) => {
      if (i === index) {
        return { ...subUom, [fieldName]: value };
      }
      return subUom;
    });
    form.setValue('subUoms', updated);
  };
  const content = (
    <div className="space-y-4">
      <div className="flex gap-2 items-center">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAddSubUom}
          className="w-full"
        >
          <IconPlus className="mr-2 w-4 h-4" />
          {t('add-sub')}
        </Button>
      </div>
      {subUoms.length > 0 && (
        <div className="flex flex-col gap-3">
          {subUoms.map((subUom, index) => (
            <div
              key={subUom._id || index}
              className={
                compact
                  ? '[&>div]:grid [&>div]:grid-cols-2 [&>div>div]:min-w-0 [&>div>div]:max-w-none [&_label]:text-xs [&_input]:text-xs'
                  : undefined
              }
            >
              <SubUomRow
                subUom={subUom}
                index={index}
                onUpdate={handleUpdateSubUom}
                onRemove={handleRemoveSubUom}
                t={t}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return compact ? (
    <ProductPanelSection
      title={t('sub-uom', 'Additional units')}
      icon={IconRulerMeasure}
      count={subUoms.length}
      disabled={disabled}
    >
      {content}
    </ProductPanelSection>
  ) : (
    <InfoCard title={t('unit-of-measurements')}>
      <InfoCard.Content>{content}</InfoCard.Content>
    </InfoCard>
  );
};
