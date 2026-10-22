import { SelectPriority } from '@/operation/components/SelectPriority';
import { DateSelectTask } from '@/task/components/task-selects/DateSelectTask';
import { SelectAssigneeTask } from '@/task/components/task-selects/SelectAssigneeTask';
import { SelectCycle } from '@/task/components/task-selects/SelectCycle';
import { SelectEstimatedPoint } from '@/task/components/task-selects/SelectEstimatedPointTask';
import { SelectMilestone } from '@/task/components/task-selects/SelectMilestone';
import { SelectProject } from '@/task/components/task-selects/SelectProjectTask';
import { SelectStatusTask } from '@/task/components/task-selects/SelectStatusTask';
import { TASK_CONTENT_TYPE } from '@/task/constants';
import {
  TTaskDraft,
  useCreateTaskRecord,
} from '@/task/hooks/useCreateTaskRecord';
import { useTaskOptionalFields } from '@/task/hooks/useTaskOptionalFields';
import { addTaskSchema } from '@/task/types/validations';
import { SelectTeam } from '@/team/components/SelectTeam';
import { useGetStatusByTeam } from '@/task/hooks/useGetStatusByTeam';
import { STATUS_TYPES } from '@/operation/components/StatusInline';
import { zodResolver } from '@hookform/resolvers/zod';
import { Editor, Form, Input, Spinner } from 'erxes-ui';
import { useEffect, useRef } from 'react';
import { Path, PathValue, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  ContactsRelationField,
  PANEL_INPUT_CLASS_NAME,
  PanelFormLayout,
  PanelFormRow,
  TagsSelect,
  useSidePanel,
  useSidePanelDraft,
} from 'ui-modules';
import { z } from 'zod';

const SCOPE = 'side-panel-task-new';

const taskDraftSchema = addTaskSchema.extend({
  customerId: z.string().nullable().optional(),
  companyId: z.string().nullable().optional(),
});

type TTaskDraftForm = z.infer<typeof taskDraftSchema>;

/**
 * A task not created yet, drawn like its Detail tab with what the draft
 * started with (team, project, status, the customer it is for, ...).
 * Nothing is saved until Save; the task then replaces the draft. Cancel
 * leaves nothing behind.
 */
export const TaskPanelNew = () => {
  const { t } = useTranslation('operation');
  const draft = useSidePanelDraft<TTaskDraft>(TASK_CONTENT_TYPE);
  const { createTaskRecord, loading } = useCreateTaskRecord();
  const { back, canGoBack, close } = useSidePanel();
  const form = useForm<TTaskDraftForm>({
    resolver: zodResolver(taskDraftSchema),
    defaultValues: {
      name: '',
      teamId: draft.teamId || '',
      status: draft.status,
      priority: draft.priority ?? 0,
      assigneeId: draft.assigneeId,
      projectId: draft.projectId,
      cycleId: draft.cycleId,
      milestoneId: draft.milestoneId,
      estimatePoint: draft.estimatePoint ?? 0,
      startDate: draft.startDate,
      targetDate: draft.targetDate,
      tagIds: draft.tagIds || [],
      customerId: draft.customerId ?? null,
      companyId: draft.companyId ?? null,
    },
  });
  const { errors } = form.formState;
  const values = form.watch();
  const {
    showCycle,
    showEstimate,
    showMilestone,
    loading: loadingOptional,
  } = useTaskOptionalFields({
    teamId: values.teamId,
    projectId: values.projectId,
  });

  const set = <K extends Path<TTaskDraftForm>>(
    name: K,
    value: PathValue<TTaskDraftForm, K>,
  ) => form.setValue(name, value, { shouldValidate: name === 'teamId' });

  // The team's statuses, to start on its first to-do one instead of an
  // empty status that fills in a moment later.
  const { statuses, loading: loadingStatuses } = useGetStatusByTeam({
    variables: { teamId: values.teamId },
    skip: !values.teamId,
  });
  const firstStatus = statuses.find(
    (status) => status.type === STATUS_TYPES.UNSTARTED,
  )?.value;

  useEffect(() => {
    if (firstStatus && !form.getValues('status')) {
      form.setValue('status', firstStatus);
    }
  }, [firstStatus, form]);

  // Drawn once: the optional rows and the status are known first.
  const ready = useRef(false);

  if (!loadingOptional && !loadingStatuses) {
    ready.current = true;
  }

  const cancel = () => (canGoBack ? back() : close());

  if (!ready.current) {
    return <Spinner containerClassName="py-12" />;
  }

  return (
    <Form {...form}>
      <form
        className="flex flex-1 min-h-0 flex-col"
        onSubmit={form.handleSubmit((task) =>
          createTaskRecord(task, { replace: true }),
        )}
      >
        <PanelFormLayout
          onCancel={cancel}
          saving={loading}
          saveLabel={t('create-task', 'Create task')}
        >
          <PanelFormRow
            label={t('name', 'Name')}
            required
            error={errors.name?.message}
          >
            <Input
              {...form.register('name')}
              autoFocus
              placeholder={t('task-name')}
              className={PANEL_INPUT_CLASS_NAME}
            />
          </PanelFormRow>
          <PanelFormRow label={t('status')}>
            <SelectStatusTask.FormItem
              variant="table"
              form={form}
              value={values.status || ''}
              onValueChange={(status) => set('status', status)}
            />
          </PanelFormRow>
          <PanelFormRow label={t('priority')}>
            <SelectPriority.FormItem
              variant="table"
              value={values.priority ?? 0}
              onValueChange={(priority) => set('priority', priority)}
            />
          </PanelFormRow>
          <PanelFormRow label={t('assignee')}>
            <SelectAssigneeTask.FormItem
              variant="table"
              scope={`${SCOPE}.assignee`}
              value={values.assigneeId || ''}
              teamIds={values.teamId ? [values.teamId] : undefined}
              onValueChange={(assigneeId) => set('assigneeId', assigneeId)}
            />
          </PanelFormRow>
          <PanelFormRow label={t('start-date')}>
            <DateSelectTask.FormItem
              variant="table"
              value={values.startDate}
              onValueChange={(date) => set('startDate', date)}
            />
          </PanelFormRow>
          <PanelFormRow label={t('due-date')}>
            <DateSelectTask.FormItem
              variant="table"
              value={values.targetDate}
              onValueChange={(date) => set('targetDate', date)}
            />
          </PanelFormRow>
          <PanelFormRow
            label={t('team')}
            required
            error={errors.teamId?.message}
          >
            <SelectTeam.FormItem
              variant="table"
              mode="single"
              value={values.teamId}
              onValueChange={(teamId) =>
                set('teamId', Array.isArray(teamId) ? teamId[0] : teamId)
              }
            />
          </PanelFormRow>
          <PanelFormRow label={t('project')}>
            <SelectProject.FormItem
              variant="table"
              scope={`${SCOPE}.project`}
              teamId={values.teamId}
              value={values.projectId}
              onValueChange={(projectId) =>
                set('projectId', projectId || undefined)
              }
            />
          </PanelFormRow>
          {showCycle && (
            <PanelFormRow label={t('cycle')}>
              <SelectCycle.FormItem
                variant="table"
                scope={`${SCOPE}.cycle`}
                teamId={values.teamId}
                value={values.cycleId}
                onValueChange={(cycleId) => set('cycleId', cycleId)}
              />
            </PanelFormRow>
          )}
          {showMilestone && (
            <PanelFormRow label={t('milestone')}>
              <SelectMilestone.FormItem
                variant="table"
                scope={`${SCOPE}.milestone`}
                projectId={values.projectId}
                value={values.milestoneId}
                onValueChange={(milestoneId) => set('milestoneId', milestoneId)}
              />
            </PanelFormRow>
          )}
          {showEstimate && (
            <PanelFormRow label={t('estimate')}>
              <SelectEstimatedPoint.FormItem
                variant="table"
                scope={`${SCOPE}.estimate`}
                teamId={values.teamId}
                value={values.estimatePoint}
                onValueChange={(point) => set('estimatePoint', point)}
              />
            </PanelFormRow>
          )}
          <PanelFormRow label={t('tags')}>
            <TagsSelect.InlineCell
              type={TASK_CONTENT_TYPE}
              mode="multiple"
              scope={`${SCOPE}.tags`}
              value={values.tagIds || []}
              onValueChange={(tagIds) =>
                set('tagIds', Array.isArray(tagIds) ? tagIds : [tagIds])
              }
            />
          </PanelFormRow>
          <PanelFormRow label={t('customers', 'Customers')}>
            <ContactsRelationField
              kind="customer"
              scope={`${SCOPE}.customer`}
              value={values.customerId}
              onValueChange={(id) => set('customerId', id)}
            />
          </PanelFormRow>
          <PanelFormRow label={t('companies', 'Companies')}>
            <ContactsRelationField
              kind="company"
              scope={`${SCOPE}.company`}
              value={values.companyId}
              onValueChange={(id) => set('companyId', id)}
            />
          </PanelFormRow>
          <div className="flex flex-col gap-1.5 pt-2">
            <span className="text-xs font-medium text-accent-foreground">
              {t('description', 'Description')}
            </span>
            <Editor
              onChange={(description) => set('description', description)}
              scope={`${SCOPE}.description`}
            />
          </div>
        </PanelFormLayout>
      </form>
    </Form>
  );
};
