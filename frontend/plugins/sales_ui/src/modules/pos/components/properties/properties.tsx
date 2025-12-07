import { useEffect } from 'react';
import {
  InfoCard,
  Input,
  Form,
  Select,
  Button,
  Checkbox,
  toast,
  MultipleSelector,
} from 'erxes-ui';
import { SelectBranches, SelectBrand, SelectDepartments } from 'ui-modules';
import { useForm } from 'react-hook-form';
import { useMutation } from '@apollo/client';
import { ALLOW_TYPES, POS_TYPES, isFieldVisible } from '@/pos/constants';
import mutations from '@/pos/graphql/mutations';
import { usePosDetail } from '@/pos/hooks/usePosDetail';

interface PropertiesProps {
  posId?: string;
  posType?: string;
}

interface FormData {
  name: string;
  description: string;
  type: string;
  maxSkipNumber: string;
  orderPassword: string;
  branchId: string;
  departmentId: string;
  allowBranchIds: string[];
  brandId: string;
  allowTypes: string[];
  isOnline: boolean;
  onServer: boolean;
  pdomain: string;
  beginNumber: string;
}

const Properties: React.FC<PropertiesProps> = ({ posId, posType }) => {
  const { posDetail, loading: detailLoading, error } = usePosDetail(posId);
  const [posEdit, { loading: saving }] = useMutation(mutations.posEdit);

  const form = useForm<FormData>({
    defaultValues: {
      name: '',
      description: '',
      type: '',
      maxSkipNumber: '',
      orderPassword: '',
      branchId: '',
      departmentId: '',
      allowBranchIds: [],
      brandId: '',
      allowTypes: [],
      isOnline: false,
      onServer: false,
      pdomain: '',
      beginNumber: '',
    },
  });

  useEffect(() => {
    if (posDetail) {
      form.reset({
        name: posDetail.name || '',
        description: posDetail.description || '',
        type: posDetail.type || '',
        maxSkipNumber: posDetail.maxSkipNumber?.toString() || '',
        orderPassword: posDetail.orderPassword || '',
        branchId: posDetail.branchId || '',
        departmentId: posDetail.departmentId || '',
        allowBranchIds: posDetail.allowBranchIds || [],
        brandId: posDetail.scopeBrandIds?.[0] || '',
        allowTypes: posDetail.allowTypes || [],
        isOnline: posDetail.isOnline || false,
        onServer: posDetail.onServer || false,
        pdomain: posDetail.pdomain || '',
        beginNumber: posDetail.beginNumber || '',
      });
    }
  }, [posDetail, form]);

  const handleSaveChanges = async (data: FormData) => {
    if (!posId) {
      toast({
        title: 'Error',
        description: 'POS ID is required',
        variant: 'destructive',
      });
      return;
    }

    try {
      await posEdit({
        variables: {
          _id: posId,
          name: data.name,
          description: data.description,
          type: data.type,
          maxSkipNumber: data.maxSkipNumber
            ? parseInt(data.maxSkipNumber, 10)
            : 0,
          orderPassword: data.orderPassword,
          branchId: data.branchId,
          departmentId: data.departmentId,
          allowBranchIds: data.allowBranchIds,
          scopeBrandIds: data.brandId ? [data.brandId] : [],
          allowTypes: data.allowTypes,
          isOnline: data.isOnline,
          onServer: data.onServer,
          pdomain: data.pdomain,
          beginNumber: data.beginNumber,
        },
      });

      toast({
        title: 'Success',
        description: 'Properties saved successfully',
      });
      form.reset(data);
    } catch {
      toast({
        title: 'Error',
        description: 'Failed to save properties',
        variant: 'destructive',
      });
    }
  };

  if (detailLoading) {
    return (
      <div className="overflow-y-auto p-6 space-y-6 max-h-screen">
        <InfoCard title="Properties">
          <InfoCard.Content>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="w-24 h-4 rounded animate-pulse bg-muted" />
                  <div className="h-8 rounded animate-pulse bg-muted" />
                </div>
              ))}
            </div>
          </InfoCard.Content>
        </InfoCard>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-destructive">
          Failed to load POS details: {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto p-6 space-y-6 max-h-screen">
      <InfoCard title="General">
        <InfoCard.Content>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleSaveChanges)}
              className="space-y-6"
            >
              <div className="grid grid-cols-2 gap-4">
                {isFieldVisible('name', posType) && (
                  <Form.Field
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Name</Form.Label>
                        <Form.Control>
                          <Input
                            type="text"
                            placeholder="POS Name"
                            {...field}
                          />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />
                )}
                {isFieldVisible('description', posType) && (
                  <Form.Field
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Description</Form.Label>
                        <Form.Control>
                          <Input
                            type="text"
                            placeholder="Description"
                            {...field}
                          />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />
                )}
                <Form.Field
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Type</Form.Label>
                      <Form.Control>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <Select.Trigger>
                            <Select.Value placeholder="Select type" />
                          </Select.Trigger>
                          <Select.Content>
                            {POS_TYPES.map((type) => (
                              <Select.Item key={type.value} value={type.value}>
                                {type.label}
                              </Select.Item>
                            ))}
                          </Select.Content>
                        </Select>
                      </Form.Control>
                    </Form.Item>
                  )}
                />
                {isFieldVisible('maxSkipNumber', posType) && (
                  <Form.Field
                    control={form.control}
                    name="maxSkipNumber"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Max Skip Number</Form.Label>
                        <Form.Control>
                          <Input
                            type="number"
                            placeholder="Max Skip number"
                            {...field}
                          />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />
                )}
                {isFieldVisible('orderPassword', posType) && (
                  <Form.Field
                    control={form.control}
                    name="orderPassword"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Order Password</Form.Label>
                        <Form.Control>
                          <Input
                            type="text"
                            placeholder="Order Password"
                            {...field}
                          />
                        </Form.Control>
                      </Form.Item>
                    )}
                  />
                )}
                {isFieldVisible('brand', posType) && (
                  <Form.Field
                    control={form.control}
                    name="brandId"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Brand</Form.Label>
                        <Form.Control>
                          <SelectBrand.FormItem
                            mode="single"
                            value={field.value ?? ''}
                            onValueChange={(brand) => field.onChange(brand)}
                          />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                )}
              </div>

              {isFieldVisible('allowTypes', posType) && (
                <Form.Field
                  control={form.control}
                  name="allowTypes"
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>Allow Types</Form.Label>
                      <Form.Control>
                        <MultipleSelector
                          value={field.value?.map((v: string) => ({
                            value: v,
                            label:
                              ALLOW_TYPES.find((t) => t.value === v)?.label ||
                              v,
                          }))}
                          onChange={(options) =>
                            field.onChange(options.map((o) => o.value))
                          }
                          defaultOptions={ALLOW_TYPES.map((t) => ({
                            value: t.value,
                            label: t.label,
                          }))}
                          placeholder="Select allow types"
                          hidePlaceholderWhenSelected
                        />
                      </Form.Control>
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              )}

              <div className="grid grid-cols-2 gap-4">
                {isFieldVisible('chooseBranch', posType) && (
                  <Form.Field
                    control={form.control}
                    name="branchId"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>Branch</Form.Label>
                        <Form.Control>
                          <SelectBranches.FormItem
                            mode="single"
                            value={field.value ?? ''}
                            onValueChange={(branch) => field.onChange(branch)}
                          />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                )}

                {isFieldVisible('chooseDepartment', posType) && (
                  <Form.Field
                    control={form.control}
                    name="departmentId"
                    render={({ field }) => (
                      <Form.Item>
                        <Form.Label>DEPARTMENT</Form.Label>
                        <Form.Control>
                          <SelectDepartments.FormItem
                            mode="single"
                            value={field.value ?? ''}
                            onValueChange={(department) =>
                              field.onChange(department)
                            }
                          />
                        </Form.Control>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-6">
                  {isFieldVisible('isOnline', posType) && (
                    <Form.Field
                      control={form.control}
                      name="isOnline"
                      render={({ field }) => (
                        <Form.Item>
                          <div className="flex items-center space-x-2">
                            <Form.Control>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </Form.Control>
                            <Form.Label>Is Online</Form.Label>
                          </div>
                          <Form.Message />
                        </Form.Item>
                      )}
                    />
                  )}

                  {form.watch('isOnline') && (
                    <div className="space-y-6">
                      {isFieldVisible('allowBranches', posType) && (
                        <Form.Field
                          control={form.control}
                          name="allowBranchIds"
                          render={({ field }) => (
                            <Form.Item>
                              <Form.Label>ALLOW BRANCHES</Form.Label>
                              <Form.Description>
                                Select the potential branches for sales from
                                this pos
                              </Form.Description>
                              <Form.Control>
                                <SelectBranches.FormItem
                                  mode="multiple"
                                  value={field.value ?? []}
                                  onValueChange={(branches) =>
                                    field.onChange(branches)
                                  }
                                />
                              </Form.Control>
                              <Form.Message />
                            </Form.Item>
                          )}
                        />
                      )}

                      {isFieldVisible('posDomain', posType) && (
                        <Form.Field
                          control={form.control}
                          name="pdomain"
                          render={({ field }) => (
                            <Form.Item>
                              <Form.Label>POS Domain</Form.Label>
                              <Form.Control>
                                <Input
                                  type="text"
                                  placeholder="POS Domain"
                                  {...field}
                                />
                              </Form.Control>
                              <Form.Message />
                            </Form.Item>
                          )}
                        />
                      )}

                      {isFieldVisible('beginNumber', posType) && (
                        <Form.Field
                          control={form.control}
                          name="beginNumber"
                          render={({ field }) => (
                            <Form.Item>
                              <Form.Label>Begin Number</Form.Label>
                              <Form.Control>
                                <Input
                                  type="number"
                                  placeholder="Begin Number"
                                  {...field}
                                />
                              </Form.Control>
                              <Form.Message />
                            </Form.Item>
                          )}
                        />
                      )}
                    </div>
                  )}
                </div>

                {isFieldVisible('onServer', posType) && (
                  <Form.Field
                    control={form.control}
                    name="onServer"
                    render={({ field }) => (
                      <Form.Item>
                        <div className="flex items-center space-x-2">
                          <Form.Control>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </Form.Control>
                          <Form.Label>On Server</Form.Label>
                        </div>
                        <Form.Message />
                      </Form.Item>
                    )}
                  />
                )}
              </div>

              {form.formState.isDirty && (
                <div className="flex justify-end pt-4 border-t">
                  <Button type="submit" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              )}
            </form>
          </Form>
        </InfoCard.Content>
      </InfoCard>
    </div>
  );
};

export default Properties;
