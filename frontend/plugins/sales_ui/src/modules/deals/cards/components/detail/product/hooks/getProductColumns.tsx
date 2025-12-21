import {
  Checkbox,
  CurrencyCode,
  CurrencyField,
  INumberFieldContainerProps,
  NumberField,
  RecordTable,
  RecordTableInlineCell,
} from 'erxes-ui';
import {
  IProductData,
  SelectBranches,
  SelectDepartments,
  SelectUOM,
} from 'ui-modules';
import { IconBuildingSkyscraper, IconGitBranch } from '@tabler/icons-react';

import { ColumnDef } from '@tanstack/table-core';
import { SelectAssigneeDeal } from '@/deals/components/deal-selects/SelectAssigneeDeal';
import clsx from 'clsx';
import { useState } from 'react';
import { useUpdateProductRecord } from '../hooks/useProductRecord';

export const ProductNumberField = ({
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
        updateRecord(product, { [field]: value });
      }}
    />
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
        console.log('value', value);
        updateRecord(product, { [field]: value });
      }}
    />
  );
};

export const ProductCurrencyField = ({
  value,
  field,
  _id,
  product,
}: {
  value: CurrencyCode;
  field: string;
  _id: string;
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
  _id,
  product,
}: {
  value: string;
  field: string;
  _id: string;
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
  _id,
  product,
}: {
  value: string;
  field: string;
  _id: string;
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
  _id,
  product,
}: {
  value: string;
  field: string;
  _id: string;
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

export const taxPercent: ColumnDef<IProductData> = {
  id: 'taxPercent',
  accessorKey: 'taxPercent',
  header: () => <RecordTable.InlineHead label="Tax %" />,
  cell: ({ cell }) => {
    return (
      <RecordTableInlineCell>
        <ProductNumberField
          value={Number(cell.getValue()) || 0}
          field="taxPercent"
          _id={cell.row.original._id}
          product={cell.row.original}
        />
      </RecordTableInlineCell>
    );
  },
  size: 100,
};

export const tax: ColumnDef<IProductData> = {
  id: 'tax',
  accessorKey: 'tax',
  header: () => <RecordTable.InlineHead label="Tax" />,
  cell: ({ cell }) => {
    return (
      <RecordTableInlineCell>
        <ProductNumberField
          value={Number(cell.getValue()) || 0}
          field="tax"
          _id={cell.row.original._id}
          product={cell.row.original}
        />
      </RecordTableInlineCell>
    );
  },
  size: 100,
};

export const currency: ColumnDef<IProductData> = {
  id: 'currency',
  accessorKey: 'currency',
  header: () => <RecordTable.InlineHead label="Currency" />,
  cell: ({ cell }) => {
    return (
      <RecordTableInlineCell>
        <ProductCurrencyField
          value={cell.getValue() as CurrencyCode}
          field="currency"
          _id={cell.row.original._id}
          product={cell.row.original}
        />
      </RecordTableInlineCell>
    );
  },
};

export const uom: ColumnDef<IProductData> = {
  id: 'uom',
  accessorKey: 'uom',
  header: () => <RecordTable.InlineHead label="UOM" />,
  cell: ({ cell }) => {
    return (
      <RecordTableInlineCell>
        <ProductUOMField
          value={cell.getValue() as string}
          field="uom"
          _id={cell.row.original._id}
          product={cell.row.original}
        />
      </RecordTableInlineCell>
    );
  },
};

export const branch: ColumnDef<IProductData> = {
  id: 'branchId',
  accessorKey: 'branchId',
  header: () => <RecordTable.InlineHead icon={IconGitBranch} label="Branch" />,
  cell: ({ cell }) => {
    return (
      <ProductBranchField
        value={cell.getValue() as string}
        field="branchId"
        _id={cell.row.original._id}
        product={cell.row.original}
      />
    );
  },
};

export const department: ColumnDef<IProductData> = {
  id: 'departmentId',
  accessorKey: 'departmentId',
  header: () => (
    <RecordTable.InlineHead icon={IconBuildingSkyscraper} label="Department" />
  ),
  cell: ({ cell }) => {
    return (
      <RecordTableInlineCell>
        <ProductDepartmentField
          value={cell.getValue() as string}
          field="departmentId"
          _id={cell.row.original._id}
          product={cell.row.original}
        />
      </RecordTableInlineCell>
    );
  },
};
