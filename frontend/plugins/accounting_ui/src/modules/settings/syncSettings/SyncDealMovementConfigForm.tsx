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
}) => (
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
}) => (
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

const DealLocationSideField = ({
  form,
}: {
  form: UseFormReturn<ConfigFormValues>;
}) => (
  <Form.Field
    control={form.control}
    name="dealLocationSide"
    render={({ field }) => (
      <Form.Item>
        <Form.Label>Deal-ийн салбар/хэлтсийг ашиглах тал</Form.Label>
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
              <Select.Item value="source">Гарах тал</Select.Item>
              <Select.Item value="destination">Орох тал</Select.Item>
            </Select.Content>
          </Select>
        </Form.Control>
        <Form.Message />
      </Form.Item>
    )}
  />
);

export const SyncDealMovementConfigForm = ({
  form,
  onSubmit,
  loading,
}: {
  form: UseFormReturn<ConfigFormValues>;
  onSubmit: (data: ConfigFormValues) => void;
  loading: boolean;
}) => {
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
          <SyncSettingSection title="Ерөнхий">
            <SyncConfigGeneralFields control={form.control} />
          </SyncSettingSection>

          <SyncConfigPipelineSection
            boardId={boardId}
            pipelineId={pipelineId}
            form={form}
          />

          <SyncSettingSection title="Данс">
            <InventoryAccountField
              form={form}
              name="sourceAccountId"
              label="Гарах барааны данс"
            />
            <InventoryAccountField
              form={form}
              name="destinationAccountId"
              label="Орох барааны данс"
            />
          </SyncSettingSection>

          <SyncSettingSection title="Default гарах байршил">
            <LocationFields
              form={form}
              branchName="defaultSourceBranchId"
              departmentName="defaultSourceDepartmentId"
              branchLabel="Гарах салбар"
              departmentLabel="Гарах хэлтэс"
            />
          </SyncSettingSection>

          <SyncSettingSection title="Default орох байршил">
            <LocationFields
              form={form}
              branchName="defaultDestinationBranchId"
              departmentName="defaultDestinationDepartmentId"
              branchLabel="Орох салбар"
              departmentLabel="Орох хэлтэс"
            />
            <DealLocationSideField form={form} />
          </SyncSettingSection>
        </div>
        <SyncConfigFormFooter loading={loading} />
      </form>
    </Form>
  );
};
