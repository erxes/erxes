import { Button, CurrencyField, Form, Input, Label, Select } from 'erxes-ui';
import { SelectBrand, SelectCategory, SelectCompany } from 'ui-modules';

import { Control } from 'react-hook-form';
import { IconUpload } from '@tabler/icons-react';
import { PRODUCT_TYPE_OPTIONS } from '@/products/constants/ProductConstants';
import { ProductFormValues } from '@/products/constants/ProductFormSchema';
import type React from 'react';

interface UnitOfMeasurement {
  _id: string;
  name: string;
}

interface ProductBasicFieldsProps {
  control: Control<ProductFormValues>;
  uoms: UnitOfMeasurement[];
}

const formLabelClassName =
  'text-xs font-semibold text-gray-500 tracking-wider mb-1';
const selectTriggerClassName = 'w-full border-gray-200 rounded-md';

export const ProductBasicFields: React.FC<ProductBasicFieldsProps> = ({
  control,
  uoms,
}) => {
  const handleBarcodeChange = (
    value: string,
    onChange: (value: string[]) => void,
  ) => {
    if (!value || value.trim() === '') {
      onChange([]);
      return;
    }

    const barcodes = value
      .split(',')
      .map((barcode) => barcode.trim())
      .filter((barcode) => barcode !== '');

    onChange(barcodes);
  };

  const barcodesToString = (barcodes: string[] | undefined): string => {
    if (!barcodes || !Array.isArray(barcodes)) {
      return '';
    }
    return barcodes.join(', ');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <Form.Field
        control={control}
        name="name"
        render={({ field }) => (
          <Form.Item>
            <Form.Label className={formLabelClassName}>PRODUCT NAME</Form.Label>
            <Form.Control>
              <Input {...field} placeholder="Enter product name" />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="barcodes"
        render={({ field }) => (
          <Form.Item>
            <Form.Label className={formLabelClassName}>BARCODES</Form.Label>
            <Form.Control>
              <Input
                value={barcodesToString(field.value)}
                onChange={(e) =>
                  handleBarcodeChange(e.target.value, field.onChange)
                }
                placeholder="Enter barcodes separated by commas"
                className="w-full rounded-md border-gray-200 focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 transition-all"
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="code"
        render={({ field }) => (
          <Form.Item>
            <Form.Label className={formLabelClassName}>CODE</Form.Label>
            <Form.Control>
              <Input {...field} placeholder="Enter code" />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="categoryId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label className={formLabelClassName}>CATEGORY</Form.Label>
            <Form.Control className="h-8">
              <SelectCategory
                selected={field.value}
                onSelect={field.onChange}
                className="w-full border border-gray-300"
                size="lg"
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="unitPrice"
        render={({ field }) => (
          <Form.Item>
            <Form.Label className={formLabelClassName}>UNIT PRICE</Form.Label>
            <Form.Control>
              <CurrencyField.ValueInput
                value={field.value}
                onChange={field.onChange}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="status"
        render={({ field }) => (
          <Form.Item>
            <Form.Label className={formLabelClassName}>STATUS</Form.Label>
            <Form.Control>
              <Input {...field} disabled className="bg-gray-50" />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="type"
        render={({ field }) => (
          <Form.Item>
            <Form.Label className={formLabelClassName}>TYPE</Form.Label>
            <Select value={field.value} onValueChange={field.onChange}>
              <Select.Trigger className={selectTriggerClassName}>
                <Select.Value placeholder="Choose type" />
              </Select.Trigger>
              <Select.Content>
                {PRODUCT_TYPE_OPTIONS.map((type) => (
                  <Select.Item key={type.value} value={type.value}>
                    {type.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="uom"
        render={({ field }) => (
          <Form.Item>
            <Form.Label className={formLabelClassName}>
              UNIT OF MEASUREMENTS
            </Form.Label>
            <Select value={field.value} onValueChange={field.onChange}>
              <Select.Trigger className={selectTriggerClassName}>
                <Select.Value placeholder="Select UOM" />
              </Select.Trigger>
              <Select.Content>
                {uoms.map((unit) => (
                  <Select.Item key={unit._id} value={unit._id}>
                    {unit.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="scopeBrandIds"
        render={({ field }) => (
          <Form.Item>
            <Form.Label className={formLabelClassName}>BRAND</Form.Label>
            <Form.Control>
              <SelectBrand
                value={
                  Array.isArray(field.value) && field.value.length > 0
                    ? field.value[0]
                    : ''
                }
                onValueChange={(brandId) => field.onChange([brandId])}
              />
            </Form.Control>
            <Form.Message className="text-destructive" />
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="vendorId"
        render={({ field }) => (
          <Form.Item>
            <Form.Label className={formLabelClassName}>VENDOR</Form.Label>
            <Form.Control>
              <SelectCompany
                value={field.value}
                onValueChange={field.onChange}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <Form.Field
        control={control}
        name="shortName"
        render={({ field }) => (
          <Form.Item>
            <Form.Label className={formLabelClassName}>SHORT NAME</Form.Label>
            <Form.Control>
              <Input {...field} placeholder="Enter short name" />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />

      <div className="space-y-2">
        <Label className={formLabelClassName}>PDF</Label>
        <Button
          variant="outline"
          className="w-full justify-between h-8"
          type="button"
        >
          Upload a PDF
          <IconUpload className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
