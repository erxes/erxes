import { useTranslation } from 'react-i18next';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { JournalEnum } from '@/settings/account/types/Account';
import { TR_STATUSES } from '@/transactions/types/constants';
import { Form, Select } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import { SelectBranches, SelectDepartments } from 'ui-modules';
import { z } from 'zod';
import {
  SyncConfigFormFooter,
  SyncConfigGeneralFields,
  SyncConfigPipelineSection,
  usePipelineReset,
} from './SyncConfigFormSections';
import { SyncSettingSection } from './SyncSettingSection';
import { useEffect } from 'react';

export const syncDealMovementConfigFormSchema = z.object({
  title: z.string(),
  boardId: z.string().optional(),
  pipelineId: z.string().optional(),
  stageId: z.string(),
  responseFieldId: z.string().optional(),
  dateRule: z.enum(['alwaysNow', 'syncedDateOrNow']),
  trStatus: z.string().optional(),
  sourceAccountId: z.string(),
  destinationAccountId: z.string(),
  defaultSourceBranchId: z.string().optional(),
  defaultSourceDepartmentId: z.string().optional(),
  defaultDestinationBranchId: z.string().optional(),
  defaultDestinationDepartmentId: z.string().optional(),
  dealLocationSide: z.enum(['source', 'destination']),
});

type ConfigFormValues = z.infer<typeof syncDealMovementConfigFormSchema>;

const InventoryAccountField = ({
  form,
  name,
  label,
}: {
  form: UseFormReturn<ConfigFormValues>;
  name: 'sourceAccountId' | 'destinationAccountId';
  label: string;
}) => {
  return (
    <Form.Field
      control={form.control}
      name={name}
      render={({ field }) => (
        <Form.Item>
          <Form.Label>{label}</Form.Label>
          <Form.Control>
            <SelectAccount.FormItem
              value={field.value}
              onValueChange={field.onChange}
              defaultFilter={{ journals: [JournalEnum.INVENTORY] }}
            />
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

const LocationFields = ({
  form,
  branchName,
  departmentName,
  branchLabel,
  departmentLabel,
}: {
  form: UseFormReturn<ConfigFormValues>;
  branchName: 'defaultSourceBranchId' | 'defaultDestinationBranchId';
  departmentName:
    | 'defaultSourceDepartmentId'
    | 'defaultDestinationDepartmentId';
  branchLabel: string;
  departmentLabel: string;
}) => {
  return (
    <>
      <Form.Field
        control={form.control}
        name={branchName}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{branchLabel}</Form.Label>
            <Form.Control>
              <SelectBranches.FormItem
                mode="single"
                value={field.value ?? ''}
                onValueChange={field.onChange}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
      <Form.Field
        control={form.control}
        name={departmentName}
        render={({ field }) => (
          <Form.Item>
            <Form.Label>{departmentLabel}</Form.Label>
            <Form.Control>
              <SelectDepartments.FormItem
                mode="single"
                value={field.value ?? ''}
                onValueChange={field.onChange}
              />
            </Form.Control>
            <Form.Message />
          </Form.Item>
        )}
      />
    </>
  );
};

const DealLocationSideField = ({
  form,
}: {
  form: UseFormReturn<ConfigFormValues>;
}) => {
  const { t } = useTranslation('accounting');
  return (
    <Form.Field
      control={form.control}
      name="dealLocationSide"
      render={({ field }) => (
        <Form.Item>
          <Form.Label>
            {t('side-using-the-deal-branch-and-department')}
          </Form.Label>
          <Form.Control>
            <Select
              value={field.value}
              onValueChange={(value) =>
                field.onChange(value as ConfigFormValues['dealLocationSide'])
              }
            >
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="source">{t('source-side')}</Select.Item>
                <Select.Item value="destination">
                  {t('destination-side')}
                </Select.Item>
              </Select.Content>
            </Select>
          </Form.Control>
          <Form.Message />
        </Form.Item>
      )}
    />
  );
};

export const SyncDealMovementConfigForm = ({
  form,
  onSubmit,
  loading,
}: {
  form: UseFormReturn<ConfigFormValues>;
  onSubmit: (data: ConfigFormValues) => void;
  loading: boolean;
}) => {
  const { t } = useTranslation('accounting');
  const { boardId, pipelineId } = usePipelineReset(form);

  useEffect(() => {
    if (!form.getValues('trStatus')) {
      form.setValue('trStatus', TR_STATUSES.COMPLETE);
    }
    if (!form.getValues('dealLocationSide')) {
      form.setValue('dealLocationSide', 'source');
    }
  }, [form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col flex-1 min-h-0 bg-background"
      >
        <div className="flex-1 min-h-0 overflow-y-auto p-5 space-y-5">
          <SyncSettingSection title={t('general')}>
            <SyncConfigGeneralFields control={form.control} />
          </SyncSettingSection>

          <SyncConfigPipelineSection
            boardId={boardId}
            pipelineId={pipelineId}
            form={form}
          />

          <SyncSettingSection title={t('account')}>
            <InventoryAccountField
              form={form}
              name="sourceAccountId"
              label={t('source-inventory-account')}
            />
            <InventoryAccountField
              form={form}
              name="destinationAccountId"
              label={t('destination-inventory-account')}
            />
          </SyncSettingSection>

          <SyncSettingSection title={t('default-source-location')}>
            <LocationFields
              form={form}
              branchName="defaultSourceBranchId"
              departmentName="defaultSourceDepartmentId"
              branchLabel={t('source-branch')}
              departmentLabel={t('source-department')}
            />
          </SyncSettingSection>

          <SyncSettingSection title={t('default-destination-location')}>
            <LocationFields
              form={form}
              branchName="defaultDestinationBranchId"
              departmentName="defaultDestinationDepartmentId"
              branchLabel={t('destination-branch')}
              departmentLabel={t('destination-department')}
            />
            <DealLocationSideField form={form} />
          </SyncSettingSection>
        </div>
        <SyncConfigFormFooter loading={loading} />
      </form>
    </Form>
  );
};
