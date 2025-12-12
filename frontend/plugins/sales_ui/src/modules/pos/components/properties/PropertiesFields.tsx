import {
  Input,
  Form,
  Select,
  Checkbox,
  MultipleSelector,
  Textarea,
} from 'erxes-ui';
import { SelectBranches, SelectBrand, SelectDepartments } from 'ui-modules';
import { Control } from 'react-hook-form';
import { ALLOW_TYPES, POS_TYPES } from '@/pos/constants';

export interface FormData {
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

export interface FieldProps {
  control: Control<FormData>;
}

export const NameField = ({ control }: FieldProps) => (
  <Form.Field
    control={control}
    name="name"
    render={({ field }) => (
      <Form.Item>
        <Form.Label>Name</Form.Label>
        <Form.Control>
          <Input type="text" placeholder="POS Name" {...field} />
        </Form.Control>
      </Form.Item>
    )}
  />
);

export const TypeField = ({ control }: FieldProps) => (
  <Form.Field
    control={control}
    name="type"
    render={({ field }) => (
      <Form.Item>
        <Form.Label>Type</Form.Label>
        <Form.Control>
          <Select value={field.value} onValueChange={field.onChange}>
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
);

export const DescriptionField = ({ control }: FieldProps) => (
  <Form.Field
    control={control}
    name="description"
    render={({ field }) => (
      <Form.Item>
        <Form.Label>Description</Form.Label>
        <Form.Control>
          <Textarea placeholder="Description" {...field} />
        </Form.Control>
      </Form.Item>
    )}
  />
);

export const MaxSkipNumberField = ({ control }: FieldProps) => (
  <Form.Field
    control={control}
    name="maxSkipNumber"
    render={({ field }) => (
      <Form.Item>
        <Form.Label>Max Skip Number</Form.Label>
        <Form.Control>
          <Input type="number" placeholder="Max Skip number" {...field} />
        </Form.Control>
      </Form.Item>
    )}
  />
);

export const OrderPasswordField = ({ control }: FieldProps) => (
  <Form.Field
    control={control}
    name="orderPassword"
    render={({ field }) => (
      <Form.Item>
        <Form.Label>Order Password</Form.Label>
        <Form.Control>
          <Input type="text" placeholder="Order Password" {...field} />
        </Form.Control>
      </Form.Item>
    )}
  />
);

export const BranchField = ({ control }: FieldProps) => (
  <Form.Field
    control={control}
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
);

export const DepartmentField = ({ control }: FieldProps) => (
  <Form.Field
    control={control}
    name="departmentId"
    render={({ field }) => (
      <Form.Item>
        <Form.Label>Department</Form.Label>
        <Form.Control>
          <SelectDepartments.FormItem
            mode="single"
            value={field.value ?? ''}
            onValueChange={(department) => field.onChange(department)}
          />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);

export const BrandField = ({ control }: FieldProps) => (
  <Form.Field
    control={control}
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
);

export const OnServerField = ({ control }: FieldProps) => (
  <Form.Field
    control={control}
    name="onServer"
    render={({ field }) => (
      <Form.Item>
        <div className="flex items-center pt-6 space-x-2">
          <Form.Control>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          </Form.Control>
          <Form.Label>On Server</Form.Label>
        </div>
        <Form.Message />
      </Form.Item>
    )}
  />
);

export const IsOnlineField = ({ control }: FieldProps) => (
  <Form.Field
    control={control}
    name="isOnline"
    render={({ field }) => (
      <Form.Item>
        <div className="flex items-center pt-6 space-x-2">
          <Form.Control>
            <Checkbox checked={field.value} onCheckedChange={field.onChange} />
          </Form.Control>
          <Form.Label>Is Online</Form.Label>
        </div>
        <Form.Message />
      </Form.Item>
    )}
  />
);

export const AllowBranchesField = ({ control }: FieldProps) => (
  <Form.Field
    control={control}
    name="allowBranchIds"
    render={({ field }) => (
      <Form.Item>
        <Form.Label>ALLOW BRANCHES</Form.Label>
        <Form.Description>
          Select the potential branches for sales from this pos
        </Form.Description>
        <Form.Control>
          <SelectBranches.FormItem
            mode="multiple"
            value={field.value ?? []}
            onValueChange={(branches) => field.onChange(branches)}
          />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);

export const PosDomainField = ({ control }: FieldProps) => (
  <Form.Field
    control={control}
    name="pdomain"
    render={({ field }) => (
      <Form.Item>
        <Form.Label>POS Domain</Form.Label>
        <Form.Control>
          <Input type="text" placeholder="POS Domain" {...field} />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);

export const BeginNumberField = ({ control }: FieldProps) => (
  <Form.Field
    control={control}
    name="beginNumber"
    render={({ field }) => (
      <Form.Item>
        <Form.Label>Begin Number</Form.Label>
        <Form.Control>
          <Input type="number" placeholder="Begin Number" {...field} />
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);

export const AllowTypesField = ({ control }: FieldProps) => (
  <Form.Field
    control={control}
    name="allowTypes"
    render={({ field }) => (
      <Form.Item>
        <Form.Label>Allow Types</Form.Label>
        <Form.Control>
          <MultipleSelector
            value={field.value?.map((v: string) => ({
              value: v,
              label: ALLOW_TYPES.find((t) => t.value === v)?.label || v,
            }))}
            onChange={(options) => field.onChange(options.map((o) => o.value))}
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
);
