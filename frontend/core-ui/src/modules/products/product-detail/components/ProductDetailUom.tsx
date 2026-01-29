import { Button, InfoCard, Label } from 'erxes-ui';
import { SelectUOM, SubUomRow, type SubUomItem } from 'ui-modules';
import { useState, useEffect } from 'react';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';

interface ProductDetailUomProps {
  uom?: string;
  subUoms?: SubUomItem[];
}

export const ProductDetailUom = ({
  uom: initialUom = '',
  subUoms: initialSubUoms = [],
}: ProductDetailUomProps) => {
  const [uom, setUom] = useState<string>(initialUom);
  const [subUoms, setSubUoms] = useState<SubUomItem[]>(initialSubUoms);
  const { t } = useTranslation('product', {
    keyPrefix: 'detail',
  });

  useEffect(() => {
    setUom(initialUom);
  }, [initialUom]);

  useEffect(() => {
    setSubUoms(initialSubUoms);
  }, [initialSubUoms]);

  const mainUom = uom;

  const handleAddSubUom = () => {
    const newSubUom: SubUomItem = {
      _id: Math.random().toString(),
      uom: '',
      ratio: 1,
    };
    setSubUoms([...subUoms, newSubUom]);
  };

  const handleRemoveSubUom = (index: number) => {
    const updated = subUoms.filter((_, i) => i !== index);
    setSubUoms(updated);
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
    setSubUoms(updated);
  };
  return (
    <InfoCard title={t('unit-of-measurements')}>
      <InfoCard.Content>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('unit-of-measurements')}</Label>
            <SelectUOM value={uom} onValueChange={setUom} />
          </div>

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
                <SubUomRow
                  key={subUom._id || index}
                  subUom={subUom}
                  index={index}
                  mainUom={mainUom || ''}
                  onUpdate={handleUpdateSubUom}
                  onRemove={handleRemoveSubUom}
                  t={t}
                />
              ))}
            </div>
          )}
        </div>
      </InfoCard.Content>
    </InfoCard>
  );
};
