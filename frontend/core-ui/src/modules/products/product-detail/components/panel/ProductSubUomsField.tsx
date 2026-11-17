import { IconPlus, IconTrash } from '@tabler/icons-react';
import { Button, NumberField } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PANEL_TEXT_FIELD_CLASS_NAME } from 'ui-modules';
import { SubUomItem } from '@/products/product-detail/types/detailTypes';
import { ProductUomField } from './ProductUomField';

// `key` is the row's React key; `_id` is the saved sub unit's, if it has one.
type TSubUomRow = { key: string; _id?: string; uom: string; ratio: number };

const toRatio = (ratio: SubUomItem['ratio']) => {
  const value = Number(ratio);
  return Number.isFinite(value) && value > 0 ? value : 1;
};

// A product may have its sub units saved as `null`.
const toRows = (subUoms?: SubUomItem[] | null): TSubUomRow[] =>
  (subUoms ?? []).map((subUom, index) => ({
    key: subUom._id || `${subUom.uom}-${index}`,
    _id: subUom._id,
    uom: subUom.uom || '',
    ratio: toRatio(subUom.ratio),
  }));

const isComplete = (row: TSubUomRow) => !!row.uom && row.ratio > 0;

/**
 * The product's sub units of measurement, beside its unit: each a unit and
 * its ratio (or the inverse). A row is saved once its unit is chosen; a new
 * one stays here until then.
 */
export const ProductSubUomsField = ({
  scope,
  subUoms,
  onChange,
}: {
  scope: string;
  subUoms?: SubUomItem[] | null;
  onChange: (subUoms: SubUomItem[]) => void;
}) => {
  const { t } = useTranslation('product', { keyPrefix: 'detail' });
  const [rows, setRows] = useState(() => toRows(subUoms));
  const saved = JSON.stringify(toRows(subUoms));

  // The saved sub units replace what is shown, unless a row is unfinished.
  useEffect(() => {
    setRows((current) =>
      current.every(isComplete) ? toRows(JSON.parse(saved)) : current,
    );
  }, [saved]);

  const commit = (next: TSubUomRow[]) => {
    setRows(next);
    if (next.every(isComplete)) {
      // A new row gets its id from the server.
      onChange(
        next.map(({ _id, uom, ratio }) =>
          _id ? { _id, uom, ratio } : { uom, ratio },
        ),
      );
    }
  };

  const update = (key: string, patch: Partial<TSubUomRow>) =>
    commit(rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  return (
    <div className="flex min-w-0 flex-col gap-1">
      {rows.length > 0 && (
        // The unit's column needs no heading: the field is labelled above.
        <div className="grid grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_1.75rem] gap-1 text-xs text-muted-foreground">
          <span />
          <span className="truncate px-2" title={t('ratio')}>
            {t('ratio')}
          </span>
          <span className="truncate px-2" title={t('inverse-ratio')}>
            {t('inverse-ratio')}
          </span>
        </div>
      )}
      {rows.map((row) => (
        <div
          key={row.key}
          className="grid grid-cols-[minmax(0,1fr)_4.5rem_4.5rem_1.75rem] items-center gap-1"
        >
          <ProductUomField
            scope={`${scope}.${row.key}.uom`}
            value={row.uom}
            placeholder={t('select-unit', 'Select unit')}
            onChange={(uom) => update(row.key, { uom })}
          />
          <NumberField
            scope={`${scope}.${row.key}.ratio`}
            value={row.ratio}
            className={PANEL_TEXT_FIELD_CLASS_NAME}
            onSave={(ratio) => ratio > 0 && update(row.key, { ratio })}
          />
          <NumberField
            scope={`${scope}.${row.key}.inverse`}
            value={1 / row.ratio}
            formatValue={(inverse) =>
              inverse.toLocaleString(undefined, { maximumFractionDigits: 4 })
            }
            className={PANEL_TEXT_FIELD_CLASS_NAME}
            onSave={(inverse) =>
              inverse > 0 && update(row.key, { ratio: 1 / inverse })
            }
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="size-7 text-destructive hover:text-destructive"
            aria-label={t('remove-sub-uom', 'Remove sub UOM')}
            onClick={() => commit(rows.filter(({ key }) => key !== row.key))}
          >
            <IconTrash />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        className="h-7 w-fit px-2 text-xs text-muted-foreground"
        onClick={() =>
          setRows([...rows, { key: `new-${Date.now()}`, uom: '', ratio: 1 }])
        }
      >
        <IconPlus />
        {t('add-sub-uom')}
      </Button>
    </div>
  );
};
