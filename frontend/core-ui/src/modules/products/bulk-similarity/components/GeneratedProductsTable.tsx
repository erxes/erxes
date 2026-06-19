import { Badge, Button, Checkbox, Table, Tooltip, cn } from 'erxes-ui';
import {
  IconAlertTriangle,
  IconStar,
  IconStarFilled,
  IconSwitchHorizontal,
} from '@tabler/icons-react';
import { useEffect, useRef } from 'react';
import { IMaskInput } from 'react-imask';
import { Controller, useFormContext, useWatch } from 'react-hook-form';
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
  labelOf,
  excludeIds,
}: {
  index: number;
  isExcluded: boolean;
  productId?: string;
  code: string;
  combination: Record<string, string>;
  baseCode: string;
  fieldIds: string[];
  labelOf: (fieldId: string, value: string) => string;
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
    const suffix = generateCodeSuffix(fieldIds, combination, labelOf);
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

export const GeneratedProductsTable = ({
  fieldName,
  unitPrice,
}: GeneratedProductsTableProps) => {
  const { control, setValue } = useFormContext<BulkSimilarityFormValues>();
  const { fieldIds, labelOf } = useVariantFields();
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
      <EmptyPanel>Select field values above to generate products.</EmptyPanel>
    );
  }

  if (rows.length > 1000) {
    return (
      <EmptyPanel variant="destructive">
        <IconAlertTriangle size={16} />
        {rows.length} combinations — too many to render. Reduce the selected
        options.
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
      <Table>
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
                        aria-label="Include all"
                      />
                    </span>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    {allIncluded ? 'Exclude all' : 'Include all'}
                  </Tooltip.Content>
                </Tooltip>
              </Tooltip.Provider>
            </Table.Head>
            <Table.Head className="px-3 w-auto">Code</Table.Head>
            <Table.Head className="px-3 w-32">Unit price</Table.Head>
            {fieldIds.map((fieldId) => (
              <Table.Head key={fieldId} className="px-3 w-36">
                {fieldName(fieldId)}
              </Table.Head>
            ))}
            <Table.Head className="px-3 w-20 text-center">Swap</Table.Head>
            <Table.Head className="px-3 w-16 text-center">Star</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {rows.map((row, index) => {
            const watchedRow = watchedRows[index];
            const combination = watchedRow?.combination || {};
            const isExcluded = !!watchedRow?.isExcluded;
            const code = watchedRow?.code || '';
            const isDup = !isExcluded && duplicateCodes?.has(code);

            return (
              <Table.Row
                key={row.key}
                className={cn(
                  isExcluded && 'opacity-50',
                  isDup && 'bg-destructive/5',
                )}
              >
                <Table.Cell className="px-3">
                  <Controller
                    control={control}
                    name={`rows.${index}.isExcluded`}
                    render={({ field }) => (
                      <Checkbox
                        checked={!field.value}
                        onCheckedChange={(checked) => field.onChange(!checked)}
                        aria-label="Include product"
                      />
                    )}
                  />
                </Table.Cell>
                <Table.Cell className="px-1">
                  <div className="flex items-center gap-1">
                    <EditableCell
                      value={code}
                      onCommit={(next) => {
                        setValue(`rows.${index}.code`, next, {
                          shouldValidate: true,
                        });
                        setValue(`rows.${index}.codeEdited`, true);
                      }}
                      placeholder="code"
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
                          <Tooltip.Content>Duplicate code</Tooltip.Content>
                        </Tooltip>
                      </Tooltip.Provider>
                    )}
                  </div>
                </Table.Cell>
                <Table.Cell className="px-1">
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
                {fieldIds.map((fieldId) => (
                  <Table.Cell key={fieldId} className="px-3">
                    <Badge variant="secondary">
                      {labelOf(fieldId, combination[fieldId])}
                    </Badge>
                  </Table.Cell>
                ))}
                <Table.Cell className="px-3">
                  <RowSwapCell
                    index={index}
                    isExcluded={isExcluded}
                    productId={row.productId}
                    code={code}
                    combination={combination}
                    baseCode={baseCode}
                    fieldIds={fieldIds}
                    labelOf={labelOf}
                    excludeIds={usedProductIds}
                  />
                </Table.Cell>
                <Table.Cell className="px-3 text-center">
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
