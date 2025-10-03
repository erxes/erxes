import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Form, Input, Select } from 'erxes-ui';
import { BasicInfoFormValues } from '../formSchema';
import { ALLOW_TYPES } from '@/pos/constants';
import { IPosDetail } from '@/pos/pos-detail/types/IPos';
import { SelectBranches, SelectBrand, SelectDepartments } from 'ui-modules';

interface EcommerceFormProps {
  form: UseFormReturn<BasicInfoFormValues>;
  posDetail?: IPosDetail;
  isReadOnly?: boolean;
}

export const EcommerceForm: React.FC<EcommerceFormProps> = ({
  form,
  isReadOnly = false,
}) => {
  const handleBrandChange = (brandId: string | string[]) => {
    if (isReadOnly) return;
    const singleBrandId = Array.isArray(brandId) ? brandId[0] : brandId;
    form.setValue('scopeBrandIds', singleBrandId ? [singleBrandId] : []);
    form.trigger('scopeBrandIds');
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

  const handleAllowTypesChange = (value: string, index: number) => {
    if (isReadOnly) return;

    const currentTypes = form.getValues('allowTypes') || [];
    const newTypes = [...currentTypes];

    if (value === 'NULL' || value === '') {
      newTypes.splice(index, 1);
    } else {
      newTypes[index] = value as 'eat' | 'take' | 'delivery';
    }

    const cleanTypes = newTypes.filter(
      (type, idx, arr) => type && arr.indexOf(type) === idx,
    );

    form.setValue('allowTypes', cleanTypes);
    form.trigger('allowTypes');
  };

  const scopeBrandIds = form.watch('scopeBrandIds') || [];
  const selectedBrandId =
    Array.isArray(scopeBrandIds) && scopeBrandIds.length > 0
      ? scopeBrandIds[0]
      : '';

  const allowTypes = form.watch('allowTypes') || [];
  const branchId = form.watch('branchId') || '';
  const departmentId = form.watch('departmentId') || '';

  return (
    <Form {...form}>
      <div className="p-3">
        <div className="space-y-6">
          <Form.Field
            control={form.control}
            name="name"
            render={({ field }) => (
              <Form.Item>
                <Form.Label className="text-sm text-[#A1A1AA] uppercase font-semibold">
                  NAME <span className="text-red-500">*</span>
                </Form.Label>
                <Form.Control>
                  <Input
                    {...field}
                    placeholder="Write here"
                    className="border border-gray-300 h-10"
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
                  <Form.Label className="text-sm text-[#A1A1AA] uppercase font-semibold">
                    DESCRIPTION <span className="text-red-500">*</span>
                  </Form.Label>
                  <p className="text-sm font-medium text-[#71717A]">
                    What is description?
                  </p>
                  <Form.Control>
                    <Input
                      {...field}
                      className="border border-gray-300 h-10"
                      value={field.value || ''}
                      disabled={isReadOnly}
                      readOnly={isReadOnly}
                      placeholder="Enter description"
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />

            <Form.Field
              control={form.control}
              name="scopeBrandIds"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="text-sm text-[#A1A1AA] uppercase font-semibold">
                    BRANDS
                  </Form.Label>
                  <p className="text-sm text-gray-500">
                    Which specific Brand does this integration belong to?
                  </p>
                  <Form.Control>
                    <SelectBrand
                      value={selectedBrandId}
                      onValueChange={handleBrandChange}
                      className="w-full h-10 border border-gray-300"
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
                <Form.Label className="text-sm text-[#A1A1AA] uppercase font-semibold">
                  TYPE <span className="text-red-500">*</span>
                </Form.Label>
                <p className="text-sm text-gray-500">How to use types?</p>
                <Form.Control>
                  <div className="grid grid-cols-3 gap-3">
                    {Array.from({ length: 6 }, (_, index) => {
                      const currentValue = allowTypes[index] || '';

                      return (
                        <div key={index} className="flex flex-col">
                          <Select
                            onValueChange={(value) =>
                              handleAllowTypesChange(value, index)
                            }
                            value={currentValue || 'NULL'}
                            disabled={isReadOnly}
                          >
                            <Select.Trigger className="w-full h-10 px-3 text-left justify-between">
                              <Select.Value
                                placeholder={`Select Type ${index + 1}`}
                              />
                            </Select.Trigger>
                            <Select.Content>
                              <Select.Item value="NULL">NULL</Select.Item>
                              {ALLOW_TYPES.map((type) => (
                                <Select.Item
                                  key={type.value}
                                  value={type.value}
                                >
                                  {type.label}
                                </Select.Item>
                              ))}
                            </Select.Content>
                          </Select>
                        </div>
                      );
                    })}
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
                  <Form.Label className="text-sm text-[#A1A1AA] uppercase font-semibold">
                    CHOOSE BRANCH
                  </Form.Label>
                  <Form.Control>
                    <SelectBranches.FormItem
                      value={branchId ?? ''}
                      onValueChange={handleBranchChange}
                      className="w-full h-10"
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
                  <Form.Label className="text-sm text-[#A1A1AA] uppercase font-semibold">
                    CHOOSE DEPARTMENT
                  </Form.Label>
                  <Form.Control>
                    <SelectDepartments.FormItem
                      value={departmentId}
                      onValueChange={handleDepartmentChange}
                      className="w-full h-10"
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
