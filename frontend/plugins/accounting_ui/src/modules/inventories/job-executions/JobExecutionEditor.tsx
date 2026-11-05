import { useMemo, useRef } from 'react';
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
  Sheet,
  Spinner,
  Table,
  toast,
  useConfirm,
} from 'erxes-ui';
import {
  SelectBranches,
  SelectDepartments,
  usePermissionCheck,
} from 'ui-modules';
import { SelectAccount } from '@/settings/account/components/SelectAccount';
import { AccountStatus, JournalEnum } from '@/settings/account/types/Account';
import { TJobForm } from '@/settings/jobs/types/Job';
import { POST_EXECUTION, SAVE_EXECUTION, UNDO_EXECUTION } from './graphql';
import { JobExecution } from './types';
import { ExecutionJobEditor } from './ExecutionJobEditor';

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

export const JobExecutionEditor = ({
  execution,
  onSaved,
}: {
  execution?: JobExecution;
  onSaved: () => void;
}) => {
  const { t } = useTranslation('accounting');
  const { hasActionPermission } = usePermissionCheck();
  const client = useApolloClient();
  const { confirm } = useConfirm();
  const forms = useRef(new Map<string, UseFormReturn<TJobForm>>());
  const inFlight = useRef(false);
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
    saving || posting || undoing || metadata.formState.isSubmitting;
  const readOnly =
    !hasActionPermission('manageJobExecutions') ||
    Boolean(execution && !['draft', 'posted'].includes(execution.status));
  const validateJobs = async () => {
    const results = await Promise.all(
      fields.map((row) => forms.current.get(row._id)?.trigger() ?? false),
    );
    return results.every(Boolean);
  };
  const submit = (createTransactions: boolean) =>
    metadata.handleSubmit(
      async (meta) => {
        if (readOnly || inFlight.current) return;
        inFlight.current = true;
        let saved = false;
        try {
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
            try {
              await confirm({
                message: t('production-confirm-undo'),
                options: {
                  okLabel: t('save-with-draft-status'),
                  cancelLabel: t('cancel'),
                },
              });
            } catch {
              return;
            }
          }
          const result = await save({
            variables: { _id: execution?._id, input: { ...meta, jobs } },
          });
          const record = result?.data?.jobExecutionSave;
          if (!record) return;
          saved = true;
          if (!createTransactions && record.status === 'posted') {
            await undo({ variables: { _id: record._id } });
          }
          if (
            createTransactions &&
            record.status === 'draft' &&
            !record.parentId
          ) {
            await post({ variables: { _id: record._id } });
          }
          await client.refetchQueries({ include: ['AccountingJobExecutions'] });
          toast({
            title: t('success'),
            description: t(
              createTransactions ? 'production-updated' : 'production-saved',
            ),
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
              include: ['AccountingJobExecutions'],
            })
            .catch(() => undefined);
          if (saved) onSaved();
        } finally {
          inFlight.current = false;
        }
      },
      () => {
        void validateJobs();
      },
    );
  return (
    <Form {...metadata}>
      <form
        className="flex flex-col flex-1 min-h-0 bg-background"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <fieldset
          disabled={readOnly || loading}
          className="flex-1 min-h-0 overflow-y-auto p-5 space-y-4"
        >
          {execution?.error && (
            <p role="alert" className="text-destructive">
              {execution.error}
            </p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Form.Field
              control={metadata.control}
              name="date"
              render={({ field }) => (
                <Form.Item>
                  <Form.Label>{t('date')}</Form.Label>
                  <Form.Control>
                    <DatePicker
                      value={field.value}
                      onChange={field.onChange}
                      disabled={readOnly || loading}
                      placeholder={t('date')}
                    />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
            <Form.Field
              control={metadata.control}
              name="description"
              render={({ field }) => (
                <Form.Item className="md:col-span-2">
                  <Form.Label>{t('description')}</Form.Label>
                  <Form.Control>
                    <Input {...field} />
                  </Form.Control>
                  <Form.Message />
                </Form.Item>
              )}
            />
          </div>
          {(['input', 'output'] as const).map((side) => (
            <section key={side} className="space-y-3">
              <Form.Label>{t('production-' + side + '-location')}</Form.Label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Form.Field
                  control={metadata.control}
                  name={`${side}AccountId`}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('account')}</Form.Label>
                      <SelectAccount.FormItem
                        mode="single"
                        value={field.value}
                        onValueChange={field.onChange}
                        defaultFilter={{
                          journals: [JournalEnum.INVENTORY],
                          status: AccountStatus.ACTIVE,
                          permissionMode: 'write',
                        }}
                      />
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={metadata.control}
                  name={`${side}BranchId`}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('branch')}</Form.Label>
                      <SelectBranches.FormItem
                        mode="single"
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                      <Form.Message />
                    </Form.Item>
                  )}
                />
                <Form.Field
                  control={metadata.control}
                  name={`${side}DepartmentId`}
                  render={({ field }) => (
                    <Form.Item>
                      <Form.Label>{t('department')}</Form.Label>
                      <SelectDepartments.FormItem
                        mode="single"
                        value={field.value}
                        onValueChange={field.onChange}
                      />
                      <Form.Message />
                    </Form.Item>
                  )}
                />
              </div>
            </section>
          ))}
          <div className="overflow-x-auto">
            <Table aria-label={t('production-job')}>
              <Table.Header>
                <Table.Row>
                  <Table.Head className="w-8" />
                  <Table.Head>{t('production-job')}</Table.Head>
                  <Table.Head className="w-40">
                    {t('production-quantity')}
                  </Table.Head>
                  <Table.Head className="w-8">
                    <span className="sr-only">
                      {t('production-remove-job')}
                    </span>
                  </Table.Head>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {fields.map((row, index) => (
                  <ExecutionJobEditor
                    key={row.id}
                    rowId={row._id}
                    index={index}
                    metadata={metadata}
                    initial={execution?.jobs.find((job) => job._id === row._id)}
                    forms={forms.current}
                    readOnly={readOnly || loading}
                    onRemove={
                      fields.length > 1 ? () => remove(index) : undefined
                    }
                  />
                ))}
              </Table.Body>
            </Table>
          </div>
          <Form.Field
            control={metadata.control}
            name="jobs"
            render={() => <Form.Message />}
          />
          {!readOnly && (
            <Button
              type="button"
              variant="secondary"
              disabled={fields.length >= 100}
              onClick={() => append({ _id: nanoid(), jobId: '', quantity: 1 })}
            >
              <IconPlus />
              {t('production-add-job')}
            </Button>
          )}
        </fieldset>
        <Sheet.Footer className="px-5 py-4 border-t bg-background shrink-0">
          <Sheet.Close asChild>
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={loading}
            >
              {t('cancel')}
            </Button>
          </Sheet.Close>
          {!readOnly && (
            <>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                disabled={loading}
                onClick={submit(false)}
              >
                {loading && <Spinner />}
                {t('save-with-draft-status')}
              </Button>
              <Button
                type="button"
                size="lg"
                disabled={loading}
                onClick={submit(true)}
              >
                {loading && <Spinner />}
                {t('save')} &amp; {t('production-post')}
              </Button>
            </>
          )}
        </Sheet.Footer>
      </form>
    </Form>
  );
};
