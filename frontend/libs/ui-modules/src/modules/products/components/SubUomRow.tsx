import { useEffect, useRef, useState } from 'react';
import { Button, Input, Label } from 'erxes-ui';
import { IconTrash } from '@tabler/icons-react';
import { SelectUOM } from './SelectUOM';

export type SubUomItem = {
  _id?: string;
  uom: string;
  ratio: number | string;
};

interface SubUomRowProps {
  readonly subUom: SubUomItem;
  readonly index: number;
  readonly onUpdate: (
    index: number,
    fieldName: keyof SubUomItem,
    value: string | number,
  ) => void;
  readonly onRemove: (index: number) => void;
  readonly t: (key: string) => string;
}

export function SubUomRow({
  subUom,
  index,
  onUpdate,
  onRemove,
  t,
}: SubUomRowProps) {
  const [localInverseRatio, setLocalInverseRatio] = useState<string>('');

  const isUpdatingFromRatioRef = useRef(false);

  const isValidNumber = (value: string | number): boolean => {
    if (value === '' || value === '-') {
      return false;
    }
    const num = typeof value === 'number' ? value : Number(value);
    return !Number.isNaN(num) && num !== 0;
  };

  const parseNumber = (value: string | number): number | null => {
    if (!isValidNumber(value)) {
      return null;
    }
    return typeof value === 'number' ? value : Number(value);
  };

  const ratioValue = parseNumber(subUom.ratio);
  const calculatedInverseRatio = ratioValue === null ? 1 : 1 / ratioValue;

  const inverseRatioDisplay =
    localInverseRatio === ''
      ? calculatedInverseRatio.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : localInverseRatio;

  useEffect(() => {
    if (!isUpdatingFromRatioRef.current) {
      setLocalInverseRatio('');
    }
  }, [subUom.ratio]);

  return (
    <div className="flex gap-2 items-end p-3 rounded-md border">
      <div className="flex flex-col flex-1 gap-2 w-full max-w-[120px]">
        <Label>{t('sub-uom') || 'SUB UOM'}</Label>
        <SelectUOM
          value={subUom.uom || ''}
          onValueChange={(value) => onUpdate(index, 'uom', value)}
        />
      </div>
      <div className="flex flex-col flex-1 gap-2">
        <Label>{t('ratio') || 'RATIO'}</Label>
        <Input
          type="text"
          inputMode="decimal"
          step={0.01}
          value={
            typeof subUom.ratio === 'string'
              ? subUom.ratio
              : subUom.ratio?.toString() ?? ''
          }
          onChange={(e) => {
            const rawValue = e.target.value;

            if (rawValue === '' || rawValue === '-') {
              onUpdate(index, 'ratio', rawValue);
              return;
            }

            const num = Number(rawValue);

            if (Number.isNaN(num)) {
              onUpdate(index, 'ratio', rawValue);
            } else {
              isUpdatingFromRatioRef.current = true;
              onUpdate(index, 'ratio', num);
              setLocalInverseRatio('');
              setTimeout(() => {
                isUpdatingFromRatioRef.current = false;
              }, 0);
            }
          }}
          onBlur={() => {
            const numValue = parseNumber(subUom.ratio);
            if (numValue === null) {
              isUpdatingFromRatioRef.current = true;
              onUpdate(index, 'ratio', 1);
              setLocalInverseRatio('');
              setTimeout(() => {
                isUpdatingFromRatioRef.current = false;
              }, 0);
            }
          }}
          placeholder="1"
        />
      </div>
      <div className="flex flex-col flex-1 gap-2">
        <Label>{t('inverse-ratio') || '~INVERSE RATIO'}</Label>
        <Input
          type="text"
          inputMode="decimal"
          step={0.01}
          value={inverseRatioDisplay}
          onChange={(e) => {
            const rawValue = e.target.value;

            setLocalInverseRatio(rawValue);

            if (rawValue === '' || rawValue === '-') {
              return;
            }

            const invValue = Number(rawValue);

            if (!Number.isNaN(invValue) && invValue !== 0) {
              const newRatio = 1 / invValue;
              isUpdatingFromRatioRef.current = true;
              onUpdate(index, 'ratio', newRatio);
              setTimeout(() => {
                isUpdatingFromRatioRef.current = false;
              }, 0);
            }
          }}
          onBlur={() => {
            const invValue = Number(localInverseRatio || inverseRatioDisplay);

            if (
              Number.isNaN(invValue) ||
              invValue === 0 ||
              localInverseRatio === '' ||
              localInverseRatio === '-'
            ) {
              isUpdatingFromRatioRef.current = true;
              onUpdate(index, 'ratio', 1);
              setLocalInverseRatio('');
              setTimeout(() => {
                isUpdatingFromRatioRef.current = false;
              }, 0);
            } else {
              setLocalInverseRatio('');
            }
          }}
          placeholder="1"
        />
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="mb-0 w-8 h-8 text-destructive hover:text-destructive shrink-0"
        onClick={() => onRemove(index)}
      >
        <IconTrash size={16} />
      </Button>
    </div>
  );
}
