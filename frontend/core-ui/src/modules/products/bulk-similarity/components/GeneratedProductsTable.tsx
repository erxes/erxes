import { Badge, Button, Checkbox, Table, Tooltip, cn } from 'erxes-ui';
import {
  IconAlertTriangle,
  IconStar,
  IconStarFilled,
  IconSwitchHorizontal,
} from '@tabler/icons-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IMaskInput } from 'react-imask';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { BulkSimilarityFormValues } from '../constants/bulkSimilaritySchema';
import { useBulkRows } from '../hooks/useBulkRows';
import { useVariantFields } from '../hooks/useVariantFields';
import { generateCodeSuffix } from '../utils';
import { ChoosableProduct, ProductChooserSheet } from './ProductChooserSheet';

const EditableCell = ({
  value,
  onCommit,
  placeholder,
  numeric,
  align = 'left',
  className,
  disabled,
  edited,
}: {
  value: string;
  onCommit: (next: string) => void;
  placeholder?: string;
  numeric?: boolean;
  align?: 'left' | 'right';
  className?: string;
  disabled?: boolean;
  edited?: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el && document.activeElement !== el && el.textContent !== value) {
      el.textContent = value;
    }
  }, [value]);

  const commit = () => {
    const next = (ref.current?.textContent ?? '').trim();
    if (next !== value) onCommit(next);
  };

  return (
    <div
      ref={ref}
      contentEditable={!disabled}
      suppressContentEditableWarning
      role="textbox"
      tabIndex={disabled ? -1 : 0}
      data-placeholder={placeholder}
      onBlur={commit}
      onBeforeInput={(e) => {
        const data = (e.nativeEvent as InputEvent).data;
        if (numeric && data && /[^0-9.\-]/.test(data)) {
          e.preventDefault();
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          ref.current?.blur();
        }
        if (e.key === 'Escape') {
          e.preventDefault();
          if (ref.current) ref.current.textContent = value;
          ref.current?.blur();
        }
      }}
      className={cn(
        'block px-2 outline-none w-full h-8 truncate leading-8 cursor-text',
        align === 'right' && 'text-right',
        'empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground',
        edited && 'text-warning',
        disabled && 'cursor-not-allowed opacity-70',
        className,
      )}
    >
      {value}
    </div>
  );
};

const NumericEditableCell = ({
  value,
  fallback,
  onCommit,
  placeholder,
  disabled,
  edited,
}: {
  value?: number;
  fallback?: number;
  onCommit: (next: number | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  edited?: boolean;
}) => {
  const shown = value ?? fallback;
  return (
    <IMaskInput
      mask={Number as any}
      thousandsSeparator=","
      radix="."
      unmask
      value={shown != null ? String(shown) : ''}
      placeholder={placeholder}
      disabled={disabled}
      autoComplete="off"
      onAccept={(val, _mask, e) => {
        if (!e) return;
        onCommit(val === '' ? undefined : Number(val));
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          (e.target as HTMLInputElement).blur();
        }
      }}
      className={cn(
        'block w-full h-8 px-2 text-right bg-transparent outline-none truncate leading-8 cursor-text',
        'placeholder:text-muted-foreground',
        edited && 'text-warning',
        disabled && 'cursor-not-allowed opacity-70',
      )}
    />
  );
};

interface GeneratedProductsTableProps {
  fieldName: (fieldId: string) => string;
  unitPrice?: number;
}

const RowSwapCell = ({
  index,
  isExcluded,
  productId,
  code,
  combination,
  baseCode,
  fieldIds,
  excludeIds,
}: {
  index: number;
  isExcluded: boolean;
  productId?: string;
  code: string;
  combination: Record<string, string>;
  baseCode: string;
  fieldIds: string[];
  excludeIds: string[];
}) => {
  const { setValue, trigger } = useFormContext<BulkSimilarityFormValues>();

  const handleChoose = (product: ChoosableProduct) => {
    setValue(`rows.${index}.productId`, product._id);
    setValue(`rows.${index}.code`, product.code);
    setValue(`rows.${index}.codeEdited`, true);
    if (product.unitPrice != null) {
      setValue(`rows.${index}.unitPrice`, product.unitPrice);
    }
    trigger('rows');
  };

  const handleClear = () => {
    const suffix = generateCodeSuffix(fieldIds, combination);
    setValue(`rows.${index}.productId`, undefined);
    setValue(`rows.${index}.code`, `${baseCode}${suffix}`);
    setValue(`rows.${index}.codeEdited`, false);
    trigger('rows');
  };

  return (
    <div className="flex justify-center items-center">
      <ProductChooserSheet
        excludeIds={excludeIds}
        value={productId}
        valueCode={code}
        onChoose={handleChoose}
        onClear={handleClear}
      >
        <Button
          type="button"
          variant={productId ? 'secondary' : 'ghost'}
          size="icon"
          className="bg-transparent size-7"
          disabled={isExcluded}
        >
          <IconSwitchHorizontal size={14} />
        </Button>
      </ProductChooserSheet>
    </div>
  );
};

const EmptyPanel = ({
  variant = 'muted',
  children,
}: {
  variant?: 'muted' | 'destructive';
  children: React.ReactNode;
}) => (
  <div
    className={cn(
      'flex justify-center items-center gap-2 px-4 py-8 border border-dashed rounded-lg text-sm',
      variant === 'muted' && 'text-muted-foreground',
      variant === 'destructive' && 'border-destructive/50 text-destructive',
    )}
  >
    {children}
  </div>
);

const DEFAULT_COLUMN_WIDTH = 144;
const MIN_COLUMN_WIDTH = 64;

const useColumnWidths = (defaults: Record<string, number>) => {
  const [widths, setWidths] = useState<Record<string, number>>(defaults);

  const widthOf = (id: string) =>
    widths[id] ?? defaults[id] ?? DEFAULT_COLUMN_WIDTH;

  const startResize = useCallback(
    (id: string, event: React.MouseEvent) => {
      event.preventDefault();
      const startX = event.clientX;
      const startWidth = widths[id] ?? defaults[id] ?? DEFAULT_COLUMN_WIDTH;

      const onMove = (e: MouseEvent) => {
        const next = Math.max(MIN_COLUMN_WIDTH, startWidth + e.clientX - startX);
        setWidths((prev) => ({ ...prev, [id]: next }));
      };

      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [widths, defaults],
  );

  return { widthOf, startResize };
};

const ResizeHandle = ({
  onMouseDown,
}: {
  onMouseDown: (e: React.MouseEvent) => void;
}) => (
  <span
    onMouseDown={onMouseDown}
    onClick={(e) => e.stopPropagation()}
    className={cn(
      'absolute top-0 right-0 z-10 h-full w-2 cursor-col-resize select-none touch-none',
      'after:absolute after:inset-y-2 after:right-0 after:w-px after:bg-border',
      'hover:after:inset-y-1 hover:after:w-0.5 hover:after:bg-primary',
    )}
  />
);

const ResizableHead = ({
  columnId,
  width,
  onResize,
  className,
  children,
}: {
  columnId: string;
  width: number;
  onResize: (id: string, e: React.MouseEvent) => void;
  className?: string;
  children: React.ReactNode;
}) => (
  <Table.Head className={cn('relative px-3', className)} style={{ width }}>
    {children}
    <ResizeHandle onMouseDown={(e) => onResize(columnId, e)} />
  </Table.Head>
);

export const GeneratedProductsTable = ({
  fieldName,
  unitPrice,
}: GeneratedProductsTableProps) => {
  const { t } = useTranslation('product', { keyPrefix: 'bulk-similarity' });
  const { control, setValue } = useFormContext<BulkSimilarityFormValues>();
  const { fieldIds, labelOf } = useVariantFields();
  const columnDefaults = useMemo(
    () => ({
      name: 224,
      code: 224,
      unitPrice: 128,
      swap: 80,
      star: 64,
      ...Object.fromEntries(fieldIds.map((id) => [id, 144])),
    }),
    [fieldIds],
  );
  const { widthOf, startResize } = useColumnWidths(columnDefaults);
  const {
    rows,
    duplicateCodes,
    includedCount,
    handleSetRowStar,
    handleSetAllExcluded,
  } = useBulkRows();
  const watchedRows = useWatch({ control, name: 'rows' }) || [];
  const baseCode = useWatch({ control, name: 'code' }) || '';

  if (!rows.length) {
    return (
      <EmptyPanel>
        {t(
          'select-values-hint',
          'Select field values above to generate products.',
        )}
      </EmptyPanel>
    );
  }

  if (rows.length > 1000) {
    return (
      <EmptyPanel variant="destructive">
        <IconAlertTriangle size={16} />
        {t('too-many-combinations', {
          count: rows.length,
          defaultValue:
            '{{count}} combinations — too many to render. Reduce the selected options.',
        })}
      </EmptyPanel>
    );
  }

  const allIncluded = includedCount === rows.length;
  const headerState: boolean | 'indeterminate' =
    includedCount === 0 ? false : allIncluded ? true : 'indeterminate';

  const usedProductIds = watchedRows
    .map((r) => r.productId)
    .filter((id): id is string => !!id);

  return (
    <div className="border rounded-lg max-h-[28rem] overflow-auto">
      <Table className="w-auto min-w-full">
        <Table.Header className="top-0 z-10 sticky bg-sidebar">
          <Table.Row>
            <Table.Head className="px-3 w-10">
              <Tooltip.Provider>
                <Tooltip>
                  <Tooltip.Trigger asChild>
                    <span className="inline-flex">
                      <Checkbox
                        checked={headerState}
                        onCheckedChange={(checked) =>
                          handleSetAllExcluded(!checked)
                        }
                        aria-label={t('include-all', 'Include all')}
                      />
                    </span>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    {allIncluded
                      ? t('exclude-all', 'Exclude all')
                      : t('include-all', 'Include all')}
                  </Tooltip.Content>
                </Tooltip>
              </Tooltip.Provider>
            </Table.Head>
            <ResizableHead
              columnId="name"
              width={widthOf('name')}
              onResize={startResize}
            >
              {t('name', 'Name')}
            </ResizableHead>
            <ResizableHead
              columnId="code"
              width={widthOf('code')}
              onResize={startResize}
            >
              {t('code', 'Code')}
            </ResizableHead>
            <ResizableHead
              columnId="unitPrice"
              width={widthOf('unitPrice')}
              onResize={startResize}
            >
              {t('unit-price', 'Unit price')}
            </ResizableHead>
            {fieldIds.map((fieldId) => (
              <ResizableHead
                key={fieldId}
                columnId={fieldId}
                width={widthOf(fieldId)}
                onResize={startResize}
              >
                <span className="block truncate" title={fieldName(fieldId)}>
                  {fieldName(fieldId)}
                </span>
              </ResizableHead>
            ))}
            <ResizableHead
              columnId="swap"
              width={widthOf('swap')}
              onResize={startResize}
              className="text-center"
            >
              {t('swap', 'Swap')}
            </ResizableHead>
            <ResizableHead
              columnId="star"
              width={widthOf('star')}
              onResize={startResize}
              className="text-center"
            >
              {t('star', 'Star')}
            </ResizableHead>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row, index) => {
            const watchedRow = watchedRows[index];
            const combination = watchedRow?.combination || {};
            const isExcluded = !!watchedRow?.isExcluded;
            const code = watchedRow?.code || '';
            const name = watchedRow?.name || '';
            const isDup = !isExcluded && duplicateCodes?.has(code);

            return (
              <Table.Row
                key={row.key}
                className={cn(
                  isExcluded && 'opacity-50',
                  isDup && 'bg-destructive/5',
                )}
              >
                <Table.Cell className="px-3 w-10">
                  <Controller
                    control={control}
                    name={`rows.${index}.isExcluded`}
                    render={({ field }) => (
                      <Checkbox
                        checked={!field.value}
                        onCheckedChange={(checked) => field.onChange(!checked)}
                        aria-label={t('include-product', 'Include product')}
                      />
                    )}
                  />
                </Table.Cell>
                <Table.Cell className="px-1" style={{ width: widthOf('name') }}>
                  <EditableCell
                    value={name}
                    onCommit={(next) => {
                      setValue(`rows.${index}.name`, next);
                      setValue(`rows.${index}.nameEdited`, true);
                    }}
                    placeholder={t('name-placeholder', 'name')}
                  />
                </Table.Cell>
                <Table.Cell className="px-1" style={{ width: widthOf('code') }}>
                  <div className="flex items-center gap-1">
                    <EditableCell
                      value={code}
                      onCommit={(next) => {
                        setValue(`rows.${index}.code`, next, {
                          shouldValidate: true,
                        });
                        setValue(`rows.${index}.codeEdited`, true);
                      }}
                      placeholder={t('code-placeholder', 'code')}
                      className="font-mono"
                    />
                    {isDup && (
                      <Tooltip.Provider>
                        <Tooltip>
                          <Tooltip.Trigger asChild>
                            <IconAlertTriangle
                              size={14}
                              className="mr-1 text-destructive shrink-0"
                            />
                          </Tooltip.Trigger>
                          <Tooltip.Content>{t('duplicate-code', 'Duplicate code')}</Tooltip.Content>
                        </Tooltip>
                      </Tooltip.Provider>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell
                  className="px-1"
                  style={{ width: widthOf('unitPrice') }}
                >
                  <Controller
                    control={control}
                    name={`rows.${index}.unitPrice`}
                    render={({ field }) => (
                      <NumericEditableCell
                        value={field.value}
                        fallback={unitPrice}
                        placeholder="0"
                        disabled={isExcluded}
                        edited={
                          field.value != null && field.value !== unitPrice
                        }
                        onCommit={field.onChange}
                      />
                    )}
                  />
                </Table.Cell>
                {fieldIds.map((fieldId) => {
                  const label = labelOf(fieldId, combination[fieldId]);
                  return (
                    <Table.Cell
                      key={fieldId}
                      className="px-3"
                      style={{ width: widthOf(fieldId) }}
                    >
                      <div className="w-full">
                        <Badge
                          variant="secondary"
                          className="max-w-full"
                          title={label}
                        >
                          <span className="truncate">{label}</span>
                        </Badge>
                      </div>
                    </Table.Cell>
                  );
                })}
                <Table.Cell className="px-3" style={{ width: widthOf('swap') }}>
                  <RowSwapCell
                    index={index}
                    isExcluded={isExcluded}
                    productId={row.productId}
                    code={code}
                    combination={combination}
                    baseCode={baseCode}
                    fieldIds={fieldIds}
                    excludeIds={usedProductIds}
                  />
                </Table.Cell>
                <Table.Cell
                  className="px-3 text-center"
                  style={{ width: widthOf('star') }}
                >
                  <Controller
                    control={control}
                    name={`rows.${index}.isStar`}
                    render={({ field }) => (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => handleSetRowStar(row.key)}
                        disabled={isExcluded}
                      >
                        {field.value ? (
                          <IconStarFilled size={14} className="text-warning" />
                        ) : (
                          <IconStar size={14} />
                        )}
                      </Button>
                    )}
                  />
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </div>
  );
};
