import type { DealProductData } from '@/deals/utils/dealJson';
import { IconBuildingSkyscraper, IconGitBranch } from '@tabler/icons-react';
import {
  Checkbox,
  CurrencyCode,
  CurrencyField,
  INumberFieldContainerProps,
  Input,
  NumberField,
  PopoverScoped,
  RecordTable,
  RecordTableInlineCell,
  Select,
  TextOverflowTooltip,
  formatAmount,
  useToast,
} from 'erxes-ui';
import { TFunction } from 'i18next';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SelectBranches, SelectDepartments } from 'ui-modules';

import { SelectAssigneeDeal } from '@/deals/components/deal-selects/SelectAssigneeDeal';
import { ColumnDef } from '@tanstack/table-core';
import clsx from 'clsx';
import { calculateProductValues } from '../../hooks/useProductCalculations';
import { useUpdateProductRecord } from '../../hooks/useProductRecord';
import { applyRowDiscount, productBaseAmount } from '../../utils/discountInfos';
import {
  ProductDataWithUom,
  getProductBaseUom,
  getProductUomCodes,
  getProductUomInfo,
  getProductUomRatio,
  normalizeProductUom,
} from '../../utils/productUom';

type ProductNumberFieldProps = Omit<INumberFieldContainerProps, '_id'> & {
  _id: DealProductData['_id'];
  product: DealProductData;
};

export const ProductNumberField = ({
  value,
  field,
  _id,
  product,
  formatValue,
  calculateProduct = false,
  children,
}: ProductNumberFieldProps & {
  formatValue?: (value: number) => string;
  calculateProduct?: boolean;
  children?: React.ReactNode;
}) => {
  const { updateRecord } = useUpdateProductRecord();

  return (
    <NumberField
      key={`${_id}-${field}-${value}`}
      value={value}
      scope={`product-${_id}-${field}`}
      formatValue={formatValue}
      onSave={(value) => {
        if (calculateProduct) {
          const base = { ...product, [field]: value };
          const updates = calculateProductValues(field, base);
          const fullUpdate = { [field]: value, ...updates };
          updateRecord(product, fullUpdate);
        } else {
          updateRecord(product, { [field]: value });
        }
      }}
    >
      {children}
    </NumberField>
  );
};

export const ProductCalculatedNumberField = ({
  value,
  field,
  _id,
  product,
}: ProductNumberFieldProps) => {
  const { updateRecord } = useUpdateProductRecord();

  return (
    <NumberField
      value={value}
      scope={`product-${_id}-${field}`}
      onSave={(value) => {
        const base = { ...product, [field]: value };
        const updates = calculateProductValues(field, base);
        const fullUpdate = { [field]: value, ...updates };
        updateRecord(product, fullUpdate);
      }}
    />
  );
};

const ProductUomInfoNumberField = ({
  product,
  field,
}: {
  product: ProductDataWithUom;
  field: 'unitPrice' | 'quantity';
}) => {
  const { updateRecord } = useUpdateProductRecord();
  const { toast } = useToast();
  const { t } = useTranslation('sales');
  const info = getProductUomInfo(product);
  const value = info[field];

  return (
    <NumberField
      key={`${product._id}-uom-info-${field}-${value}`}
      value={value}
      scope={`product-${product._id}-uom-info-${field}`}
      formatValue={field === 'unitPrice' ? formatAmount : undefined}
      onSave={(value) => {
        if (!Number.isFinite(value) || value < 0) {
          toast({
            variant: 'destructive',
            title: t('invalid-value', 'Invalid value'),
            description: t(
              'value-non-negative',
              'Value must be a finite non-negative number.',
            ),
          });
          return;
        }

        const next = normalizeProductUom({
          ...product,
          uomInfo: { ...info, [field]: value },
        });
        if (
          !Number.isFinite(next.unitPrice) ||
          !Number.isFinite(next.quantity)
        ) {
          toast({
            variant: 'destructive',
            title: t('invalid-value', 'Invalid value'),
            description: t(
              'uom-value-too-large',
              'Value is too large for this UOM ratio.',
            ),
          });
          return;
        }
        updateRecord(product, {
          uomInfo: next.uomInfo,
          unitPrice: next.unitPrice,
          quantity: next.quantity,
          ...calculateProductValues(field, next),
        });
      }}
    />
  );
};

export const ProductDiscountNumberField = ({
  value,
  field,
  _id,
  product,
}: ProductNumberFieldProps) => {
  const { updateRecord } = useUpdateProductRecord();
  const [isOpen, setIsOpen] = useState(false);
  const [editingValue, setEditingValue] = useState(String(value));
  const [isEdited, setIsEdited] = useState(false);

  const resetEditing = () => {
    setEditingValue(String(value));
    setIsEdited(false);
  };

  const handleSave = (nextValue: number) => {
    const baseAmount = productBaseAmount(product);
    const targetDiscountAmount =
      field === 'discountPercent' ? (baseAmount * nextValue) / 100 : nextValue;
    const updatedProduct = applyRowDiscount(product, targetDiscountAmount);

    updateRecord(product, {
      discountInfos: updatedProduct.discountInfos,
      discount: updatedProduct.discount,
      discountPercent: updatedProduct.discountPercent,
      tax: updatedProduct.tax,
      amount: updatedProduct.amount,
    });
  };

  const handleAction = (e?: React.FormEvent) => {
    e?.preventDefault();

    const trimmedValue = editingValue.trim();

    if (trimmedValue === '' || trimmedValue === '-') {
      resetEditing();
      setIsOpen(false);
      return;
    }

    const numValue = Number(trimmedValue);

    if (Number.isFinite(numValue) && numValue !== value) {
      handleSave(numValue);
    }

    setIsEdited(false);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      resetEditing();
      setIsOpen(false);
    }
  };

  return (
    <PopoverScoped
      scope={`product-${_id}-${field}`}
      open={isOpen}
      onOpenChange={(open: boolean) => {
        setIsOpen(open);
        if (open) {
          resetEditing();
        } else if (isEdited) {
          handleAction();
        }
      }}
    >
      <RecordTableInlineCell.Trigger>
        <TextOverflowTooltip value={value.toLocaleString()} />
      </RecordTableInlineCell.Trigger>
      <RecordTableInlineCell.Content asChild>
        <form onSubmit={handleAction}>
          <Input
            type="text"
            value={editingValue}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const rawValue = e.target.value.replace(/,/g, '');

              if (
                rawValue === '' ||
                rawValue === '-' ||
                rawValue.match(/^-?\d*\.?\d*$/)
              ) {
                setEditingValue(rawValue);
                setIsEdited(true);
              }
              setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
          />
          <button type="submit" className="sr-only">
            Save
          </button>
        </form>
      </RecordTableInlineCell.Content>
    </PopoverScoped>
  );
};

export const CheckInputField = ({
  value,
  field,
  product,
}: {
  value: boolean;
  field: string;
  product: DealProductData;
}) => {
  const { updateRecord } = useUpdateProductRecord();
  const [checked, setChecked] = useState(value);

  const handleChange = (checked: boolean | 'indeterminate') => {
    const normalized = checked === true;
    setChecked(normalized); // updates checkbox visually
    updateRecord(product, { [field]: normalized });
  };

  return (
    <RecordTableInlineCell>
      <Checkbox
        className="mt-0!"
        checked={checked}
        onCheckedChange={handleChange}
      />
    </RecordTableInlineCell>
  );
};

export const ProductAssigneeField = ({
  value,
  field,
  _id,
  product,
}: {
  value: string[];
  field: string;
  _id: DealProductData['_id'];
  product: DealProductData;
}) => {
  const { updateRecord } = useUpdateProductRecord();

  return (
    <SelectAssigneeDeal
      variant="table"
      id={_id ?? undefined}
      value={value}
      scope={clsx(_id, 'Assignee')}
      onValueChange={(value) => {
        updateRecord(product, { [field]: value });
      }}
    />
  );
};

export const ProductCurrencyField = ({
  value,
  field,
  product,
}: {
  value: CurrencyCode;
  field: string;
  product: DealProductData;
}) => {
  const { updateRecord } = useUpdateProductRecord();

  return (
    <CurrencyField.SelectCurrency
      value={value as CurrencyCode}
      variant="ghost"
      onChange={(value) => {
        updateRecord(product, { [field]: value });
      }}
    />
  );
};

export const ProductUomField = ({
  product,
}: {
  product: ProductDataWithUom;
}) => {
  const { updateRecord } = useUpdateProductRecord();
  const info = getProductUomInfo(product);
  const baseUom = getProductBaseUom(product);
  const uomCodes = getProductUomCodes(product.product, info.uom, baseUom);

  return (
    <Select
      value={info.uom}
      onValueChange={(uom) => {
        const ratio =
          uom === info.uom
            ? info.ratio
            : getProductUomRatio(product.product, uom, baseUom);
        if (!ratio) return;

        updateRecord(product, {
          uomInfo: getProductUomInfo({ ...product, uomInfo: { uom, ratio } }),
        });
      }}
      disabled={uomCodes.length === 0}
    >
      <Select.Trigger>
        <Select.Value placeholder="Choose UOM" />
      </Select.Trigger>
      <Select.Content>
        {uomCodes.length ? (
          uomCodes.map((uom) => (
            <Select.Item
              key={uom}
              value={uom}
              disabled={
                uom !== info.uom &&
                !getProductUomRatio(product.product, uom, baseUom)
              }
            >
              {uom}
            </Select.Item>
          ))
        ) : (
          <div className="flex flex-col gap-2 justify-center items-center py-8 text-sm text-center text-muted-foreground">
            No UOMs available
          </div>
        )}
      </Select.Content>
    </Select>
  );
};

export const ProductBranchField = ({
  value,
  field,
  product,
}: {
  value: string;
  field: string;
  product: DealProductData;
}) => {
  const { updateRecord } = useUpdateProductRecord();

  return (
    <SelectBranches.InlineCell
      mode="single"
      value={value}
      onValueChange={(value) => {
        updateRecord(product, { [field]: value });
      }}
    />
  );
};

export const ProductDepartmentField = ({
  value,
  field,
  product,
}: {
  value: string;
  field: string;
  product: DealProductData;
}) => {
  const { updateRecord } = useUpdateProductRecord();

  return (
    <SelectDepartments.InlineCell
      mode="single"
      value={value}
      onValueChange={(value) => {
        updateRecord(product, { [field]: value });
      }}
    />
  );
};

export const taxPercent = (t: TFunction): ColumnDef<DealProductData> => ({
  id: 'taxPercent',
  accessorKey: 'taxPercent',
  header: () => <RecordTable.InlineHead label={t('tax-percent')} />,
  cell: ({ cell }) => {
    return (
      <RecordTableInlineCell>
        <ProductCalculatedNumberField
          value={Number(cell.getValue()) || 0}
          field="taxPercent"
          _id={cell.row.original._id}
          product={cell.row.original}
        />
      </RecordTableInlineCell>
    );
  },
  size: 100,
});

export const tax = (t: TFunction): ColumnDef<DealProductData> => ({
  id: 'tax',
  accessorKey: 'tax',
  header: () => <RecordTable.InlineHead label={t('tax')} />,
  cell: ({ cell }) => {
    return (
      <RecordTableInlineCell>
        <ProductCalculatedNumberField
          value={Number(cell.getValue()) || 0}
          field="tax"
          _id={cell.row.original._id}
          product={cell.row.original}
        />
      </RecordTableInlineCell>
    );
  },
  size: 100,
});

export const currency = (t: TFunction): ColumnDef<DealProductData> => ({
  id: 'currency',
  accessorKey: 'currency',
  header: () => <RecordTable.InlineHead label={t('currency')} />,
  cell: ({ cell }) => {
    return (
      <RecordTableInlineCell>
        <ProductCurrencyField
          value={cell.getValue() as CurrencyCode}
          field="currency"
          product={cell.row.original}
        />
      </RecordTableInlineCell>
    );
  },
});

export const baseUom = (t: TFunction): ColumnDef<DealProductData> => ({
  id: 'uom',
  accessorKey: 'uom',
  header: () => <RecordTable.InlineHead label={t('uom')} />,
  cell: ({ cell }) => {
    return (
      <RecordTableInlineCell>
        <TextOverflowTooltip value={getProductBaseUom(cell.row.original)} />
      </RecordTableInlineCell>
    );
  },
  size: 52,
  minSize: 52,
  maxSize: 52,
});

export const uomInfoUom = (t: TFunction): ColumnDef<DealProductData> => ({
  id: 'uomInfo.uom',
  accessorFn: (row) => getProductUomInfo(row).uom,
  header: () => <RecordTable.InlineHead label={t('uom')} />,
  cell: ({ row }) => (
    <RecordTableInlineCell>
      <ProductUomField product={row.original} />
    </RecordTableInlineCell>
  ),
  size: 140,
});

export const uomRatio = (t: TFunction): ColumnDef<DealProductData> => ({
  id: 'uomInfo.ratio',
  accessorFn: (row) => getProductUomInfo(row).ratio,
  header: () => <RecordTable.InlineHead label={t('ratio', 'Ratio')} />,
  cell: ({ row }) => (
    <RecordTableInlineCell>
      <TextOverflowTooltip
        value={String(getProductUomInfo(row.original).ratio)}
      />
    </RecordTableInlineCell>
  ),
  size: 90,
});

export const uomInfoUnitPrice = (t: TFunction): ColumnDef<DealProductData> => ({
  id: 'uomInfo.unitPrice',
  accessorFn: (row) => getProductUomInfo(row).unitPrice,
  header: () => <RecordTable.InlineHead label={t('unit-price')} />,
  cell: ({ row }) => (
    <RecordTableInlineCell>
      <ProductUomInfoNumberField product={row.original} field="unitPrice" />
    </RecordTableInlineCell>
  ),
  size: 130,
});

export const uomInfoQuantity = (t: TFunction): ColumnDef<DealProductData> => ({
  id: 'uomInfo.quantity',
  accessorFn: (row) => getProductUomInfo(row).quantity,
  header: () => <RecordTable.InlineHead label={t('quantity')} />,
  cell: ({ row }) => (
    <RecordTableInlineCell>
      <ProductUomInfoNumberField product={row.original} field="quantity" />
    </RecordTableInlineCell>
  ),
  size: 150,
});

export const branch = (t: TFunction): ColumnDef<DealProductData> => ({
  id: 'branchId',
  accessorKey: 'branchId',
  header: () => (
    <RecordTable.InlineHead icon={IconGitBranch} label={t('branch')} />
  ),
  cell: ({ cell }) => {
    return (
      <ProductBranchField
        value={cell.getValue() as string}
        field="branchId"
        product={cell.row.original}
      />
    );
  },
});

export const department = (t: TFunction): ColumnDef<DealProductData> => ({
  id: 'departmentId',
  accessorKey: 'departmentId',
  header: () => (
    <RecordTable.InlineHead
      icon={IconBuildingSkyscraper}
      label={t('department')}
    />
  ),
  cell: ({ cell }) => {
    return (
      <RecordTableInlineCell>
        <ProductDepartmentField
          value={cell.getValue() as string}
          field="departmentId"
          product={cell.row.original}
        />
      </RecordTableInlineCell>
    );
  },
});
