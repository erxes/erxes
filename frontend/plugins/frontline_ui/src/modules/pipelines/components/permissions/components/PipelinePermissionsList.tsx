import {
  Button,
  Combobox,
  Form,
  PopoverScoped,
  Spinner,
  toast,
} from 'erxes-ui';
import {
  Control,
  ControllerRenderProps,
  UseFormReturn,
  useForm,
  useWatch,
} from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdatePipeline } from '@/pipelines/hooks/useUpdatePipeline';
import { useEffect, useState, useRef, memo } from 'react';
import { UPDATE_PIPELINE_PERMISSIONS_FORM_SCHEMA } from '@/settings/schema/pipeline';
import { PermissionState, StatusItem } from '@/pipelines/types';
import { SelectMember } from 'ui-modules';
import { useGetTicketStatusesByPipeline } from '@/status/hooks/useGetTicketStatus';
import { useUpdateTicketStatus } from '@/status/hooks/useUpdateTicketStatus';
import { PipelineSection } from '@/pipelines/components/PipelineSection';
import { PermissionRule } from '@/pipelines/components/permissions/components/PermissionRule';
import { StatusPermissionControl } from './StatusPermissionControl';
import { PipelineVisibility } from './PipelineVisibility';
import { VISIBILITY_RULES } from '../constant';

const INITIAL_STATUS_COUNT = 5;

type UpdateStatusFn = ReturnType<typeof useUpdateTicketStatus>['updateStatus'];

const SelectTeamMembersField = ({
  field,
}: {
  field: ControllerRenderProps<PermissionState, 'selectedUsers'>;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <SelectMember.Provider
      mode="multiple"
      onValueChange={(value) =>
        field.onChange(Array.isArray(value) ? value : [])
      }
      value={field.value}
    >
      <PopoverScoped>
        <Combobox.Trigger className="w-full">
          <SelectMember.Value placeholder={t('select-team-members')} />
        </Combobox.Trigger>
        <Combobox.Content>
          <SelectMember.Content />
        </Combobox.Content>
      </PopoverScoped>
    </SelectMember.Provider>
  );
};

const VisibilityRuleRow = ({
  control,
  rule,
}: {
  control: Control<PermissionState>;
  rule: (typeof VISIBILITY_RULES)[number];
}) => {
  const { t } = useTranslation('frontline');
  const myTicketsOnly = useWatch({ control, name: 'myTicketsOnly' });

  return (
    <div>
      <Form.Field
        control={control}
        name={rule.name}
        render={({ field }) => (
          <PermissionRule field={field} label={t(rule.label)} />
        )}
      />

      {rule.name === 'myTicketsOnly' && myTicketsOnly && (
        <Form.Field
          control={control}
          name="selectedUsers"
          render={({ field }) => (
            <Form.Item className="pb-3">
              <Form.Label>{t('members-see-all-tickets')}</Form.Label>
              <Form.Control>
                <SelectTeamMembersField field={field} />
              </Form.Control>
              <Form.Message />
            </Form.Item>
          )}
        />
      )}
    </div>
  );
};

const StatusPermissionsSection = ({
  statuses,
  updateStatus,
  values,
}: {
  statuses: StatusItem[];
  updateStatus: UpdateStatusFn;
  values: PermissionState;
}) => {
  const { t } = useTranslation('frontline');
  const [visibleStatusCount, setVisibleStatusCount] =
    useState(INITIAL_STATUS_COUNT);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col divide-y">
        {statuses.slice(0, visibleStatusCount).map((status: StatusItem) => (
          <StatusPermissionControl
            key={status.value}
            status={status}
            updateStatus={updateStatus}
            values={values}
          />
        ))}
      </div>

      {statuses.length > INITIAL_STATUS_COUNT && (
        <Button
          className="w-full"
          onClick={() => {
            if (visibleStatusCount >= statuses.length) {
              setVisibleStatusCount(INITIAL_STATUS_COUNT);
              return;
            }

            setVisibleStatusCount((previousCount) =>
              Math.min(previousCount + INITIAL_STATUS_COUNT, statuses.length),
            );
          }}
          size="sm"
          type="button"
          variant="outline"
        >
          {visibleStatusCount >= statuses.length
            ? t('show-less')
            : t('show-n-more', {
                count: Math.min(
                  INITIAL_STATUS_COUNT,
                  statuses.length - visibleStatusCount,
                ),
              })}
        </Button>
      )}
    </div>
  );
};

const PipelinePermissionsFormBody = ({
  form,
  statuses,
  updateStatus,
  values,
}: {
  form: UseFormReturn<PermissionState>;
  statuses: StatusItem[];
  updateStatus: UpdateStatusFn;
  values: PermissionState;
}) => {
  const { t } = useTranslation('frontline');

  return (
    <div className="flex flex-col divide-y">
      <PipelineSection title={t('pipeline-visibility')}>
        <PipelineVisibility control={form.control} />
      </PipelineSection>

      <PipelineSection
        description={t('control-ticket-visibility')}
        title={t('visibility-rules')}
      >
        <div className="flex flex-col divide-y">
          {VISIBILITY_RULES.map((rule) => (
            <VisibilityRuleRow
              control={form.control}
              key={rule.name}
              rule={rule}
            />
          ))}
        </div>
      </PipelineSection>

      {statuses.length > 0 && (
        <PipelineSection title={t('status-permissions')}>
          <StatusPermissionsSection
            statuses={statuses}
            updateStatus={updateStatus}
            values={values}
          />
        </PipelineSection>
      )}
    </div>
  );
};

export const PipelinePermissionsList = memo(() => {
  const { t } = useTranslation('frontline');
  const { pipelineId } = useParams<{ pipelineId: string }>();

  const { pipeline, loading: pipelineLoading } = useGetPipeline(pipelineId);
  const { statuses, loading: statusesLoading } =
    useGetTicketStatusesByPipeline();
  const { updatePipeline } = useUpdatePipeline();
  const { updateStatus } = useUpdateTicketStatus();

  const form = useForm<PermissionState>({
    resolver: zodResolver(UPDATE_PIPELINE_PERMISSIONS_FORM_SCHEMA),
    defaultValues: {
      _id: pipelineId,
      dayAfterCreated: false,
      branchOnly: false,
      myTicketsOnly: false,
      departmentOnly: false,
      selectedUsers: [],
      visibility: 'public',
      memberIds: [],
    },
  });

  const myTicketsOnly = form.watch('myTicketsOnly');

  const prevMyTicketsOnlyRef = useRef<boolean | null>(null);

  useEffect(() => {
    if (
      prevMyTicketsOnlyRef.current !== null &&
      !myTicketsOnly &&
      prevMyTicketsOnlyRef.current
    ) {
      form.setValue('selectedUsers', []);
    }
    prevMyTicketsOnlyRef.current = myTicketsOnly;
  }, [myTicketsOnly, form]);

  const initialValuesRef = useRef<PermissionState | null>(null);
  const isUpdatingRef = useRef(false);
  const prevVisibilityRef = useRef<PermissionState['visibility'] | null>(null);

  useEffect(() => {
    if (!pipeline) return;

    if (
      !initialValuesRef.current ||
      initialValuesRef.current._id !== pipeline._id
    ) {
      const formValues = {
        _id: pipeline._id || '',
        dayAfterCreated: pipeline.isCheckDate || false,
        branchOnly: pipeline.isCheckBranch || false,
        myTicketsOnly: pipeline.isCheckUser || false,
        departmentOnly: pipeline.isCheckDepartment || false,
        selectedUsers: pipeline.excludeCheckUserIds || [],
        visibility: (pipeline.visibility?.trim() || 'public') as
          | 'public'
          | 'private',
        memberIds: pipeline.memberIds || [],
      };

      if (!initialValuesRef.current) {
        initialValuesRef.current = formValues;
      }

      form.reset(formValues);
    }
  }, [pipeline, form]);

  const formValues = form.watch();

  useEffect(() => {
    if (!pipeline || isUpdatingRef.current || !initialValuesRef.current) return;

    const currentVisibility = formValues.visibility;

    if (
      prevVisibilityRef.current !== null &&
      prevVisibilityRef.current !== 'public' &&
      currentVisibility === 'public'
    ) {
      form.setValue('memberIds', []);
      form.setValue('selectedUsers', []);
    }

    prevVisibilityRef.current = currentVisibility;
  }, [formValues.visibility, pipeline, form]);

  useEffect(() => {
    if (!pipeline || isUpdatingRef.current || !initialValuesRef.current) return;

    const initialValues = initialValuesRef.current;

    const hasChanges =
      formValues.dayAfterCreated !== initialValues.dayAfterCreated ||
      formValues.branchOnly !== initialValues.branchOnly ||
      formValues.myTicketsOnly !== initialValues.myTicketsOnly ||
      formValues.departmentOnly !== initialValues.departmentOnly ||
      formValues.visibility !== initialValues.visibility ||
      JSON.stringify(formValues.selectedUsers) !==
        JSON.stringify(initialValues.selectedUsers) ||
      JSON.stringify(formValues.memberIds) !==
        JSON.stringify(initialValues.memberIds);

    if (hasChanges) {
      isUpdatingRef.current = true;

      updatePipeline({
        variables: {
          _id: pipelineId,
          excludeCheckUserIds: formValues.selectedUsers,
          isCheckDate: formValues.dayAfterCreated,
          isCheckBranch: formValues.branchOnly,
          isCheckUser: formValues.myTicketsOnly,
          isCheckDepartment: formValues.departmentOnly,
          visibility: formValues.visibility,
          memberIds: formValues.memberIds,
        },
      })
        .then(() => {
          initialValuesRef.current = { ...formValues };
        })
        .catch((error: Error) => {
          // Put the surface back on the last saved values, otherwise the next
          // render sees the same pending change and retries the failed save
          // forever.
          toast({
            title: t('error'),
            description: error.message,
            variant: 'destructive',
          });
          form.reset(initialValues);
        })
        .finally(() => {
          isUpdatingRef.current = false;
        });
    }
  }, [form, formValues, pipeline, pipelineId, t, updatePipeline]);

  if (pipelineLoading || statusesLoading) {
    return <Spinner containerClassName="py-32" />;
  }

  return (
    <Form {...form}>
      <form>
        <PipelinePermissionsFormBody
          form={form}
          statuses={statuses}
          updateStatus={updateStatus}
          values={formValues}
        />
      </form>
    </Form>
  );
});

PipelinePermissionsList.displayName = 'PipelinePermissionsList';
