import { useTranslation } from 'react-i18next';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { JournalEnum } from '@/settings/account/types/Account';
import { TR_STATUSES } from '@/transactions/types/constants';
import { Form } from 'erxes-ui';
import { UseFormReturn } from 'react-hook-form';
import {
  PANEL_INPUT_CLASS_NAME,
  SelectBranches,
  SelectDepartments,
} from 'ui-modules';
import { z } from 'zod';
import {
  SyncConfigGeneralFields,
  SyncConfigPipelineSection,
  usePipelineReset,
} from './SyncConfigFormSections';
import { SyncPanelFormRow, SyncSettingSection } from './SyncSettingSection';
import { useEffect } from 'react';
import { SettingsPanelDraftForm } from '@/settings/components/panel/SettingsPanelLayout';
import { SettingsPanelSelect } from '@/settings/components/panel/SettingsPanelFields';

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
      render={({ field, fieldState }) => (
        <SyncPanelFormRow label={label} error={fieldState.error?.message}>
          <SelectAccount.FormItem
            value={field.value}
            onValueChange={field.onChange}
            className={PANEL_INPUT_CLASS_NAME}
            defaultFilter={{ journals: [JournalEnum.INVENTORY] }}
          />
        </SyncPanelFormRow>
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
        render={({ field, fieldState }) => (
          <SyncPanelFormRow
            label={branchLabel}
            error={fieldState.error?.message}
          >
            <SelectBranches.FormItem
              mode="single"
              value={field.value ?? ''}
              onValueChange={field.onChange}
              className={PANEL_INPUT_CLASS_NAME}
            />
          </SyncPanelFormRow>
        )}
      />
      <Form.Field
        control={form.control}
        name={departmentName}
        render={({ field, fieldState }) => (
          <SyncPanelFormRow
            label={departmentLabel}
            error={fieldState.error?.message}
          >
            <SelectDepartments.FormItem
              mode="single"
              value={field.value ?? ''}
              onValueChange={field.onChange}
              className={PANEL_INPUT_CLASS_NAME}
            />
          </SyncPanelFormRow>
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
      render={({ field, fieldState }) => (
        <SyncPanelFormRow
          label={t('side-using-the-deal-branch-and-department')}
          error={fieldState.error?.message}
        >
          <SettingsPanelSelect<ConfigFormValues['dealLocationSide']>
            value={field.value}
            placeholder={t('side-using-the-deal-branch-and-department')}
            options={[
              { value: 'source', label: t('source-side') },
              { value: 'destination', label: t('destination-side') },
            ]}
            onValueChange={field.onChange}
            className={PANEL_INPUT_CLASS_NAME}
          />
        </SyncPanelFormRow>
      )}
    />
  );
};

export const SyncDealMovementConfigForm = ({
  form,
  onSubmit,
  loading,
  onCancel,
}: {
  form: UseFormReturn<ConfigFormValues>;
  onSubmit: (data: ConfigFormValues) => void;
  loading: boolean;
  onCancel: () => void;
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
    <SettingsPanelDraftForm
      form={form}
      onSubmit={onSubmit}
      onCancel={onCancel}
      saving={loading}
    >
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
    </SettingsPanelDraftForm>
  );
};
