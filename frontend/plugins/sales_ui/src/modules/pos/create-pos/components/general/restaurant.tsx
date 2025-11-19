import React, { useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Button, Form, Input, Select } from 'erxes-ui';
import { BasicInfoFormValues } from '../formSchema';
import { SelectBranches, SelectBrand, SelectDepartments } from 'ui-modules';
import { IPosDetail } from '~/modules/pos/pos-detail/types/IPos';
import {
  ALLOW_TYPES,
  AllowedPosType,
  DEFAULT_ALLOW_TYPE,
  ALLOWED_TYPE_VALUES,
} from '~/modules/pos/constants';

interface RestaurantFormProps {
  form: UseFormReturn<BasicInfoFormValues>;
  posDetail?: IPosDetail;
  isReadOnly?: boolean;
}

interface FieldHandler {
  value: AllowedPosType[];
  onChange: (value: AllowedPosType[]) => void;
}

const handleTypeChange = (
  field: FieldHandler,
  index: number,
  value: string,
  isReadOnly: boolean,
) => {
  if (isReadOnly) return;
  const newTypes = [...(field.value || [])];
  newTypes[index] = value as AllowedPosType;
  field.onChange(newTypes);
};

const handleTypeRemove = (
  field: FieldHandler,
  index: number,
  isReadOnly: boolean,
) => {
  if (isReadOnly) return;
  const newTypes = field.value.filter(
    (_: AllowedPosType, i: number) => i !== index,
  );
  if (newTypes.length === 0) {
    field.onChange([DEFAULT_ALLOW_TYPE]);
  } else {
    field.onChange(newTypes);
  }
};

const handleTypeAdd = (field: FieldHandler) => {
  const currentTypes = field.value || [];
  const availableTypes = ALLOW_TYPES.filter(
    (type) =>
      ALLOWED_TYPE_VALUES.includes(type.value as AllowedPosType) &&
      !currentTypes.includes(type.value as AllowedPosType),
  );
  if (availableTypes.length > 0) {
    field.onChange([
      ...currentTypes,
      availableTypes[0].value as AllowedPosType,
    ]);
  }
};

export const RestaurantForm: React.FC<RestaurantFormProps> = ({
  form,
  isReadOnly = false,
}) => {
  useEffect(() => {
    const currentAllowTypes = form.getValues('allowTypes');
    if (!currentAllowTypes || currentAllowTypes.length === 0) {
      form.setValue('allowTypes', [DEFAULT_ALLOW_TYPE]);
    }
  }, [form]);

  const handleBrandChange = (brandId: string | string[]) => {
    if (isReadOnly) return;
    const singleBrandId = Array.isArray(brandId) ? brandId[0] : brandId;
    form.setValue('scopeBrandIds', singleBrandId ? [singleBrandId] : []);
  };

  const handleBranchChange = (branchId: string | string[] | undefined) => {
    if (isReadOnly) return;
    const singleBranchId = Array.isArray(branchId) ? branchId[0] : branchId;
    form.setValue('branchId', singleBranchId || '');
    form.trigger('branchId');
  };

  const handleDepartmentChange = (
    departmentId: string | string[] | undefined,
  ) => {
    if (isReadOnly) return;
    const singleDepartmentId = Array.isArray(departmentId)
      ? departmentId[0]
      : departmentId;
    form.setValue('departmentId', singleDepartmentId || '');
    form.trigger('departmentId');
  };

  const selectedBrandId = form.watch('scopeBrandIds')?.[0] || '';

  return (
    <Form {...form}>
      <div className="p-3">
        <div className="space-y-6">
          <Form.Field
            control={form.control}
            name="name"
            render={({ field }) => (
              <Form.Item>
                <Form.Label className="text-sm font-semibold uppercase">
                  NAME <span className="text-destructive">*</span>
                </Form.Label>
                <Form.Control>
                  <Input
                    {...field}
                    placeholder="Write here"
                    className="h-8"
                    disabled={isReadOnly}
                    readOnly={isReadOnly}
                  />
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <div className="grid grid-cols-2 gap-6">
            <Form.Field
              control={form.control}
              name="description"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="text-sm font-semibold uppercase">
                    DESCRIPTION <span className="text-destructive">*</span>
                  </Form.Label>
                  <Form.Description className="text-sm font-medium">
                    What is description ?
                  </Form.Description>
                  <Form.Control>
                    <Input
                      {...field}
                      className="h-8"
                      value={field.value || ''}
                      disabled={isReadOnly}
                      readOnly={isReadOnly}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={form.control}
              name="scopeBrandIds"
              render={() => (
                <Form.Item>
                  <Form.Label className="text-sm font-semibold uppercase">
                    BRANDS
                  </Form.Label>
                  <Form.Description className="text-sm font-medium">
                    Which specific Brand does this integration belongs to?
                  </Form.Description>
                  <Form.Control>
                    <SelectBrand
                      value={selectedBrandId}
                      onValueChange={handleBrandChange}
                      className="w-full h-8"
                      disabled={isReadOnly}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>

          <Form.Field
            control={form.control}
            name="allowTypes"
            render={({ field }) => (
              <Form.Item>
                <Form.Label className="text-sm font-semibold uppercase">
                  TYPE <span className="text-destructive">*</span>
                </Form.Label>
                <Form.Description className="text-sm font-medium">
                  How use types ?
                </Form.Description>
                <Form.Control>
                  <div className="space-y-2">
                    {(field.value || []).map((selectedType, index) => (
                      <div
                        key={`type-${selectedType || 'empty'}-${index}`}
                        className="flex gap-2"
                      >
                        <Select
                          onValueChange={(value) =>
                            handleTypeChange(field, index, value, isReadOnly)
                          }
                          value={selectedType || ''}
                          disabled={isReadOnly}
                        >
                          <Select.Trigger className="justify-between px-3 w-full h-8 text-left">
                            <Select.Value
                              placeholder={`Select Type ${index + 1}`}
                            />
                          </Select.Trigger>
                          <Select.Content>
                            {ALLOW_TYPES.filter((type) =>
                              ALLOWED_TYPE_VALUES.includes(
                                type.value as AllowedPosType,
                              ),
                            ).map((type) => (
                              <Select.Item key={type.value} value={type.value}>
                                {type.label}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-8"
                          onClick={() =>
                            handleTypeRemove(field, index, isReadOnly)
                          }
                          disabled={isReadOnly}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}

                    <div className="flex justify-end">
                      {!isReadOnly && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleTypeAdd(field)}
                          disabled={isReadOnly}
                        >
                          Add Type
                        </Button>
                      )}
                    </div>
                  </div>
                </Form.Control>
                <Form.Message />
              </Form.Item>
            )}
          />

          <div className="grid grid-cols-2 gap-6">
            <Form.Field
              control={form.control}
              name="branchId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="text-sm font-semibold uppercase">
                    CHOOSE BRANCH
                  </Form.Label>
                  <Form.Control>
                    <SelectBranches.FormItem
                      value={field.value}
                      onValueChange={handleBranchChange}
                      className="w-full h-8"
                      mode="single"
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="departmentId"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="text-sm font-semibold uppercase">
                    CHOOSE DEPARTMENT
                  </Form.Label>
                  <Form.Control>
                    <SelectDepartments.FormItem
                      value={field.value}
                      onValueChange={handleDepartmentChange}
                      className="w-full h-8"
                      mode="single"
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
        </div>
      </div>
    </Form>
  );
};
