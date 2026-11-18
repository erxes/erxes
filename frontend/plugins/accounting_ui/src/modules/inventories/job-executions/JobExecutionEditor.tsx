import { useMemo, useRef, useState } from 'react';
import { useApolloClient, useMutation } from '@apollo/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { nanoid } from 'nanoid';
import { useFieldArray, useForm, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { IconPlus } from '@tabler/icons-react';
import {
  Button,
  DatePicker,
  Form,
  Input,
  Spinner,
  toast,
  useConfirm,
} from 'erxes-ui';
import {
  PANEL_INPUT_CLASS_NAME,
  PanelFormRow,
  SelectBranches,
  SelectDepartments,
  usePermissionCheck,
} from 'ui-modules';
import { AccountingEmptyState } from '@/layout/components/AccountingEmptyState';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { AccountStatus, JournalEnum } from '@/settings/account/types/Account';
import { SettingsPanelAddButton } from '@/settings/components/panel/SettingsPanelActions';
import {
  ISettingsPanelViewProps,
  ISettingsPanelViews,
} from '@/settings/components/panel/SettingsPanelLayout';
import { SETTINGS_PANEL_CELL_CLASS_NAME } from '@/settings/constants/settingsPanel';
import { useSettingsPanel } from '@/settings/hooks/useSettingsPanel';
import { TJobForm } from '@/settings/jobs/types/Job';
import {
  POST_EXECUTION,
  SAVE_EXECUTION,
  UNDO_EXECUTION,
} from '@/inventories/job-executions/graphql';
import { JobExecution } from '@/inventories/job-executions/types';
import { ExecutionJobEditor } from '@/inventories/job-executions/ExecutionJobEditor';
import { JOB_EXECUTION_CONTENT_TYPE } from '@/inventories/job-executions/jobExecutionPanel';
import { useJobExecutionDetail } from '@/inventories/job-executions/useJobExecutionDetail';

const SCOPE = 'side-panel-job-execution';

export const getExecutionMetadataSchema = (required: string) =>
  z.object({
    date: z.date({ required_error: required, invalid_type_error: required }),
    description: z.string(),
    inputAccountId: z.string().min(1, required),
    inputBranchId: z.string(),
    inputDepartmentId: z.string(),
    outputAccountId: z.string().min(1, required),
    outputBranchId: z.string(),
    outputDepartmentId: z.string(),
    jobs: z
      .array(
        z.object({
          _id: z.string().min(1),
          jobId: z.string().min(1, required),
          quantity: z.number().finite().positive(required),
        }),
      )
      .min(1, required)
      .max(100),
  });
export type ExecutionMetadata = z.infer<
  ReturnType<typeof getExecutionMetadataSchema>
>;

export const AddJobExecution = () => {
  const { t } = useTranslation('accounting');

  return (
    <SettingsPanelAddButton
      contentType={JOB_EXECUTION_CONTENT_TYPE}
      label={t('production-add')}
    />
  );
};

export const JobExecutionEditor = ({
  execution,
  onSaved,
  onCancel,
}: {
  execution?: JobExecution;
  onSaved: () => void;
  onCancel: () => void;
}) => {
  const { t } = useTranslation('accounting');
  const { hasActionPermission } = usePermissionCheck();
  const client = useApolloClient();
  const { confirm } = useConfirm();
  const forms = useRef(new Map<string, UseFormReturn<TJobForm>>());
  const inFlight = useRef(false);
  const [persisting, setPersisting] = useState(false);
  const schema = useMemo(
    () => getExecutionMetadataSchema(t('production-required')),
    [t],
  );
  const metadata = useForm<ExecutionMetadata>({
    resolver: zodResolver(schema),
    defaultValues: {
      date: execution?.date ? new Date(execution.date) : new Date(),
      description: execution?.description ?? '',
      inputAccountId: execution?.inputAccountId ?? '',
      inputBranchId: execution?.inputBranchId ?? '',
      inputDepartmentId: execution?.inputDepartmentId ?? '',
      outputAccountId: execution?.outputAccountId ?? '',
      outputBranchId: execution?.outputBranchId ?? '',
      outputDepartmentId: execution?.outputDepartmentId ?? '',
      jobs: execution?.jobs.map((row) => ({
        _id: row._id,
        jobId: row.jobId,
        quantity: row.quantity,
      })) ?? [{ _id: nanoid(), jobId: '', quantity: 1 }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control: metadata.control,
    name: 'jobs',
  });
  const [save, { loading: saving }] = useMutation(SAVE_EXECUTION);
  const [post, { loading: posting }] = useMutation(POST_EXECUTION);
  const [undo, { loading: undoing }] = useMutation(UNDO_EXECUTION);
  const loading =
    saving ||
    posting ||
    undoing ||
    persisting ||
    metadata.formState.isSubmitting;
  const readOnly =
    !hasActionPermission('manageJobExecutions') ||
    Boolean(execution && !['draft', 'posted'].includes(execution.status));
  const validateJobs = async () => {
    const results = await Promise.all(
      fields.map((row) => forms.current.get(row._id)?.trigger() ?? false),
    );
    return results.every(Boolean);
  };
  const persist = async (
    meta: ExecutionMetadata,
    jobs: (ExecutionMetadata['jobs'][number] &
      Pick<TJobForm, 'inputs' | 'outputs' | 'laborCosts' | 'overheadCosts'>)[],
    createTransactions: boolean,
  ) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setPersisting(true);
    let saved = false;
    try {
      const result = await save({
        variables: { _id: execution?._id, input: { ...meta, jobs } },
      });
      const record = result?.data?.jobExecutionSave;
      if (!record) return;
      saved = true;
      if (!createTransactions && record.status === 'posted') {
        await undo({ variables: { _id: record._id } });
      }
      if (createTransactions && record.status === 'draft' && !record.parentId) {
        await post({ variables: { _id: record._id } });
      }
      await client.refetchQueries({
        include: ['AccountingJobExecutions', 'AccountingJobExecutionDetail'],
      });
      toast({
        title: t('success'),
        description: t(
          createTransactions ? 'production-updated' : 'production-saved',
        ),
        variant: 'success',
      });
      onSaved();
    } catch (error) {
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
      await client
        .refetchQueries({
          include: ['AccountingJobExecutions', 'AccountingJobExecutionDetail'],
        })
        .catch(() => undefined);
      if (saved) onSaved();
    } finally {
      inFlight.current = false;
      setPersisting(false);
    }
  };
  const submit = (createTransactions: boolean) =>
    metadata.handleSubmit(
      async (meta) => {
        if (readOnly || inFlight.current) return;
        if (!(await validateJobs())) return;
        const jobForms = meta.jobs.flatMap((row) => {
          const form = forms.current.get(row._id);
          return form ? [{ row, form }] : [];
        });
        if (jobForms.length !== meta.jobs.length) return;
        const jobs = jobForms.map(({ row, form }) => {
          const values = form.getValues();
          return {
            ...row,
            inputs: values.inputs,
            outputs: values.outputs,
            laborCosts: values.laborCosts,
            overheadCosts: values.overheadCosts,
          };
        });
        if (!createTransactions && execution?.status === 'posted') {
          void confirm({
            message: t('production-confirm-undo'),
            options: {
              okLabel: t('save-with-draft-status'),
              cancelLabel: t('cancel'),
            },
          }).then(() => persist(meta, jobs, false));
          return;
        }
        await persist(meta, jobs, createTransactions);
      },
      () => {
        void validateJobs();
      },
    );
  return (
    <Form {...metadata}>
      <form
        className="flex flex-1 min-h-0 flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="flex min-w-0 flex-col gap-1 p-3">
            <fieldset
              disabled={readOnly || loading}
              className="flex min-w-0 flex-col gap-1"
            >
              {execution?.error && (
                <p role="alert" className="px-1 pb-2 text-xs text-destructive">
                  {execution.error}
                </p>
              )}
              <Form.Field
                control={metadata.control}
                name="date"
                render={({ field, fieldState }) => (
                  <PanelFormRow
                    label={t('date')}
                    required
                    error={fieldState.error?.message}
                  >
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      disabled={readOnly || loading}
                      placeholder={t('date')}
                      className={PANEL_INPUT_CLASS_NAME}
                    />
                  </PanelFormRow>
                )}
              />
              <Form.Field
                control={metadata.control}
                name="description"
                render={({ field }) => (
                  <PanelFormRow label={t('description')}>
                    <Input
                      {...field}
                      autoComplete="off"
                      className={PANEL_INPUT_CLASS_NAME}
                    />
                  </PanelFormRow>
                )}
              />
              {(['input', 'output'] as const).map((side) => (
                <section key={side} className="flex flex-col gap-1 pt-3">
                  <Form.Label>
                    {t('production-' + side + '-location')}
                  </Form.Label>
                  <Form.Field
                    control={metadata.control}
                    name={`${side}AccountId`}
                    render={({ field, fieldState }) => (
                      <PanelFormRow
                        label={t('account')}
                        required
                        error={fieldState.error?.message}
                      >
                        <SelectAccount
                          value={field.value}
                          onValueChange={field.onChange}
                          defaultFilter={{
                            journals: [JournalEnum.INVENTORY],
                            status: AccountStatus.ACTIVE,
                            permissionMode: 'write',
                          }}
                          variant="ghost"
                          hideChevron
                          className={SETTINGS_PANEL_CELL_CLASS_NAME}
                        />
                      </PanelFormRow>
                    )}
                  />
                  <Form.Field
                    control={metadata.control}
                    name={`${side}BranchId`}
                    render={({ field }) => (
                      <PanelFormRow label={t('branch')}>
                        <SelectBranches.InlineCell
                          mode="single"
                          scope={`${SCOPE}.${side}Branch`}
                          value={field.value}
                          onValueChange={field.onChange}
                        />
                      </PanelFormRow>
                    )}
                  />
                  <Form.Field
                    control={metadata.control}
                    name={`${side}DepartmentId`}
                    render={({ field }) => (
                      <PanelFormRow label={t('department')}>
                        <SelectDepartments.InlineCell
                          mode="single"
                          scope={`${SCOPE}.${side}Department`}
                          value={field.value}
                          onValueChange={field.onChange}
                        />
                      </PanelFormRow>
                    )}
                  />
                </section>
              ))}
            </fieldset>
            <section className="flex flex-col gap-2 pt-3">
              <div className="flex items-center justify-between gap-3">
                <Form.Label>{t('production-job')}</Form.Label>
                {!readOnly && (
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={loading || fields.length >= 100}
                    onClick={() =>
                      append({ _id: nanoid(), jobId: '', quantity: 1 })
                    }
                  >
                    <IconPlus />
                    {t('production-add-job')}
                  </Button>
                )}
              </div>
              {fields.map((row, index) => (
                <ExecutionJobEditor
                  key={row.id}
                  rowId={row._id}
                  index={index}
                  metadata={metadata}
                  initial={execution?.jobs.find((job) => job._id === row._id)}
                  forms={forms.current}
                  readOnly={readOnly || loading}
                  onRemove={fields.length > 1 ? () => remove(index) : undefined}
                />
              ))}
              <Form.Field
                control={metadata.control}
                name="jobs"
                render={() => <Form.Message />}
              />
            </section>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1 border-t bg-background p-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={loading}
            onClick={onCancel}
          >
            {t('cancel')}
          </Button>
          {!readOnly && (
            <>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={loading}
                onClick={submit(false)}
              >
                {loading && <Spinner size="sm" />}
                {t('save-with-draft-status')}
              </Button>
              <Button
                type="button"
                size="sm"
                disabled={loading}
                onClick={submit(true)}
              >
                {loading && <Spinner size="sm" />}
                {t('save')} &amp; {t('production-post')}
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  );
};

const JobExecutionPanelNew = () => {
  const { cancelDraft, closePanel } = useSettingsPanel(
    JOB_EXECUTION_CONTENT_TYPE,
  );

  return <JobExecutionEditor onSaved={closePanel} onCancel={cancelDraft} />;
};

const JobExecutionPanelDetail = ({ contentId }: ISettingsPanelViewProps) => {
  const { closePanel } = useSettingsPanel(JOB_EXECUTION_CONTENT_TYPE);
  const { execution, loading, error } = useJobExecutionDetail(contentId);

  if (!execution) {
    if (loading) {
      return <Spinner containerClassName="py-12" />;
    }

    return <AccountingEmptyState error={error} />;
  }

  return (
    <JobExecutionEditor
      key={execution._id}
      execution={execution}
      onSaved={closePanel}
      onCancel={closePanel}
    />
  );
};

export const JOB_EXECUTION_PANEL: ISettingsPanelViews = {
  addLabel: 'production-add',
  editLabel: 'production-edit',
  New: JobExecutionPanelNew,
  Detail: JobExecutionPanelDetail,
};
