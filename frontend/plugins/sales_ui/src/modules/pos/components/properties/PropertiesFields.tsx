import {
  IconAlignLeft,
  IconBuilding,
  IconBuildingStore,
  IconCashRegister,
  IconHierarchy2,
  IconListCheck,
  IconLock,
  IconNumber,
  IconPlayerSkipForward,
  IconServer,
  IconTag,
  IconWorld,
} from '@tabler/icons-react';
import {
  Input,
  Form,
  Checkbox,
  MultipleSelector,
  Switch,
  Textarea,
} from 'erxes-ui';
import { SelectBranches, SelectBrand, SelectDepartments } from 'ui-modules';
import { Control } from 'react-hook-form';
import { ALLOW_TYPES } from '@/pos/constants';
import {
  POS_PANEL_INPUT_CLASS_NAME,
  POS_PANEL_TEXTAREA_CLASS_NAME,
} from '@/pos/constants/posPanel';
import { PosFieldRow } from '@/pos/components/pos-edit/PosFieldRow';
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
        <PosFieldRow label={t('name')} icon={IconCashRegister}>
          <Input
            type="text"
            placeholder={t('pos-name-placeholder')}
            className={POS_PANEL_INPUT_CLASS_NAME}
            {...field}
          />
        </PosFieldRow>
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
        <PosFieldRow label={t('description')} icon={IconAlignLeft}>
          <Textarea
            placeholder={t('description')}
            rows={3}
            className={POS_PANEL_TEXTAREA_CLASS_NAME}
            {...field}
          />
        </PosFieldRow>
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
        <PosFieldRow label={t('max-skip-number')} icon={IconPlayerSkipForward}>
          <Input
            type="number"
            placeholder={t('max-skip-number')}
            className={POS_PANEL_INPUT_CLASS_NAME}
            {...field}
          />
        </PosFieldRow>
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
        <PosFieldRow label={t('order-password')} icon={IconLock}>
          <Input
            type="text"
            placeholder={t('order-password')}
            className={POS_PANEL_INPUT_CLASS_NAME}
            {...field}
          />
        </PosFieldRow>
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
        <PosFieldRow label={t('branch')} icon={IconBuilding}>
          <SelectBranches.FormItem
            mode="single"
            value={field.value ?? ''}
            onValueChange={(branch) => field.onChange(branch)}
          />
        </PosFieldRow>
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
        <PosFieldRow label={t('department')} icon={IconHierarchy2}>
          <SelectDepartments.FormItem
            mode="single"
            value={field.value ?? ''}
            onValueChange={(department) => field.onChange(department)}
          />
        </PosFieldRow>
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
        <PosFieldRow label={t('brand')} icon={IconTag}>
          <SelectBrand.FormItem
            mode="single"
            value={field.value ?? ''}
            onValueChange={(brand) => field.onChange(brand)}
          />
        </PosFieldRow>
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
        <PosFieldRow label={t('on-server')} icon={IconServer}>
          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
        </PosFieldRow>
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
        <Form.Item className="flex items-center justify-between gap-4 space-y-0 rounded-md px-2 py-2 hover:bg-accent/50">
          <div className="min-w-0 space-y-0.5">
            <Form.Label variant="peer" className="text-xs font-medium">
              {t('online-pos', 'Online POS')}
            </Form.Label>
            <Form.Description>
              {field.value
                ? t(
                    'online-pos-description',
                    'Takes orders on a website for the branches you allow.',
                  )
                : t(
                    'offline-pos-description',
                    'Runs at a counter in the store for the order types you allow.',
                  )}
            </Form.Description>
          </div>
          <Form.Control>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </Form.Control>
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
        <PosFieldRow
          label={t('allow-branches')}
          icon={IconBuildingStore}
          description={t('allow-branches-description')}
        >
          <SelectBranches.FormItem
            mode="multiple"
            value={field.value ?? []}
            onValueChange={(branches) => field.onChange(branches)}
          />
        </PosFieldRow>
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
        <PosFieldRow label={t('pos-domain')} icon={IconWorld}>
          <Input
            type="text"
            placeholder={t('pos-domain')}
            className={POS_PANEL_INPUT_CLASS_NAME}
            {...field}
          />
        </PosFieldRow>
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
        <PosFieldRow label={t('begin-number')} icon={IconNumber}>
          <Input
            type="number"
            placeholder={t('begin-number')}
            className={POS_PANEL_INPUT_CLASS_NAME}
            {...field}
          />
        </PosFieldRow>
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
        <PosFieldRow label={t('allow-types')} icon={IconListCheck}>
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
        </PosFieldRow>
      )}
    />
  );
};
