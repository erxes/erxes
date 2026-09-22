import {
  Input,
  Form,
  Checkbox,
  MultipleSelector,
  Textarea,
} from 'erxes-ui';
import { SelectBranches, SelectBrand, SelectDepartments } from 'ui-modules';
import { Control } from 'react-hook-form';
import { ALLOW_TYPES } from '@/pos/constants';
import { useTranslation } from 'react-i18next';

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

export const NameField = ({ control }: FieldProps) => {
  const { t } = useTranslation('sales');
  return (
    <Form.Field
      control={control}
      name="name"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('name')}</Form.Label>
          <Form.Control>
            <Input type="text" placeholder={t('pos-name-placeholder')} {...field} />
          </Form.Control>
        </Form.Item>
      )}
    />
  );
};

export const DescriptionField = ({ control }: FieldProps) => {
  const { t } = useTranslation('sales');
  return (
    <Form.Field
      control={control}
      name="description"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('description')}</Form.Label>
          <Form.Control>
            <Textarea placeholder={t('description')} {...field} />
          </Form.Control>
        </Form.Item>
      )}
    />
  );
};

export const MaxSkipNumberField = ({ control }: FieldProps) => {
  const { t } = useTranslation('sales');
  return (
    <Form.Field
      control={control}
      name="maxSkipNumber"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('max-skip-number')}</Form.Label>
          <Form.Control>
            <Input type="number" placeholder={t('max-skip-number')} {...field} />
          </Form.Control>
        </Form.Item>
      )}
    />
  );
};

export const OrderPasswordField = ({ control }: FieldProps) => {
  const { t } = useTranslation('sales');
  return (
    <Form.Field
      control={control}
      name="orderPassword"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('order-password')}</Form.Label>
          <Form.Control>
            <Input type="text" placeholder={t('order-password')} {...field} />
          </Form.Control>
        </Form.Item>
      )}
    />
  );
};

export const BranchField = ({ control }: FieldProps) => {
  const { t } = useTranslation('sales');
  return (
    <Form.Field
      control={control}
      name="branchId"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('branch')}</Form.Label>
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
};

export const DepartmentField = ({ control }: FieldProps) => {
  const { t } = useTranslation('sales');
  return (
    <Form.Field
      control={control}
      name="departmentId"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('department')}</Form.Label>
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
};

export const BrandField = ({ control }: FieldProps) => {
  const { t } = useTranslation('sales');
  return (
    <Form.Field
      control={control}
      name="brandId"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('brand')}</Form.Label>
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
};

export const OnServerField = ({ control }: FieldProps) => {
  const { t } = useTranslation('sales');
  return (
    <Form.Field
      control={control}
      name="onServer"
      render={({ field }) => (
        <Form.Item>
          <div className="flex items-center pt-6 space-x-2">
            <Form.Control>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </Form.Control>
            <Form.Label>{t('on-server')}</Form.Label>
          </div>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

export const IsOnlineField = ({ control }: FieldProps) => {
  const { t } = useTranslation('sales');
  return (
    <Form.Field
      control={control}
      name="isOnline"
      render={({ field }) => (
        <Form.Item>
          <div className="flex items-center pt-6 space-x-2">
            <Form.Control>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </Form.Control>
            <Form.Label>{t('is-online')}</Form.Label>
          </div>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

export const AllowBranchesField = ({ control }: FieldProps) => {
  const { t } = useTranslation('sales');
  return (
    <Form.Field
      control={control}
      name="allowBranchIds"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('allow-branches')}</Form.Label>
          <Form.Description>
            {t('allow-branches-description')}
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
};

export const PosDomainField = ({ control }: FieldProps) => {
  const { t } = useTranslation('sales');
  return (
    <Form.Field
      control={control}
      name="pdomain"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('pos-domain')}</Form.Label>
          <Form.Control>
            <Input type="text" placeholder={t('pos-domain')} {...field} />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

export const BeginNumberField = ({ control }: FieldProps) => {
  const { t } = useTranslation('sales');
  return (
    <Form.Field
      control={control}
      name="beginNumber"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('begin-number')}</Form.Label>
          <Form.Control>
            <Input type="number" placeholder={t('begin-number')} {...field} />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

export const AllowTypesField = ({ control }: FieldProps) => {
  const { t } = useTranslation('sales');
  return (
    <Form.Field
      control={control}
      name="allowTypes"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{t('allow-types')}</Form.Label>
          <Form.Control>
            <MultipleSelector
              value={field.value?.map((v: string) => ({
                value: v,
                label: ALLOW_TYPES.find((at) => at.value === v)?.label || v,
              }))}
              onChange={(options) => field.onChange(options.map((o) => o.value))}
              defaultOptions={ALLOW_TYPES.map((at) => ({
                value: at.value,
                label: at.label,
              }))}
              placeholder={t('select-allow-types')}
              hidePlaceholderWhenSelected
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};
