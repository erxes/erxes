import React, { useState } from 'react';
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
  TextOverflowTooltip,
} from 'erxes-ui';
import {
  IProductData,
  SelectBranches,
  SelectDepartments,
  SelectUOM,
} from 'ui-modules';
import { IconBuildingSkyscraper, IconGitBranch } from '@tabler/icons-react';
import { TFunction } from 'i18next';

import { ColumnDef } from '@tanstack/table-core';
import { SelectAssigneeDeal } from '@/deals/components/deal-selects/SelectAssigneeDeal';
import clsx from 'clsx';
import { useUpdateProductRecord } from '../../hooks/useProductRecord';
import { calculateProductValues } from '../../hooks/useProductCalculations';
import { applyRowDiscount, productBaseAmount } from '../../utils/discountInfos';

export const ProductNumberField = ({
  value,
  field,
  _id,
  product,
  formatValue,
  calculateProduct = false,
  children,
}: INumberFieldContainerProps & {
  product: IProductData;
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
}: INumberFieldContainerProps & { product: IProductData }) => {
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

export const ProductDiscountNumberField = ({
  value,
  field,
  _id,
  product,
}: INumberFieldContainerProps & { product: IProductData }) => {
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
  product: IProductData;
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
  _id: string;
  product: IProductData;
}) => {
  const { updateRecord } = useUpdateProductRecord();

  return (
    <SelectAssigneeDeal
      variant="table"
      id={_id}
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
  product: IProductData;
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

export const ProductUOMField = ({
  value,
  field,
  product,
}: {
  value: string;
  field: string;
  product: IProductData;
}) => {
  const { updateRecord } = useUpdateProductRecord();

  return (
    <SelectUOM
      value={value}
      onValueChange={(value) => updateRecord(product, { [field]: value })}
    />
  );
};

export const ProductBranchField = ({
  value,
  field,
  product,
}: {
  value: string;
  field: string;
  product: IProductData;
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
  product: IProductData;
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

export const taxPercent = (t: TFunction): ColumnDef<IProductData> => ({
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

export const tax = (t: TFunction): ColumnDef<IProductData> => ({
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

export const currency = (t: TFunction): ColumnDef<IProductData> => ({
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

export const uom = (t: TFunction): ColumnDef<IProductData> => ({
  id: 'uom',
  accessorKey: 'uom',
  header: () => <RecordTable.InlineHead label={t('uom')} />,
  cell: ({ cell }) => {
    return (
      <RecordTableInlineCell>
        <ProductUOMField
          value={cell.getValue() as string}
          field="uom"
          product={cell.row.original}
        />
      </RecordTableInlineCell>
    );
  },
});

export const branch = (t: TFunction): ColumnDef<IProductData> => ({
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

export const department = (t: TFunction): ColumnDef<IProductData> => ({
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
