import {
  InfoCard,
  Button,
  Form,
  Spinner,
  PopoverScoped,
  Combobox,
} from 'erxes-ui';
import { useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { useGetPipeline } from '@/pipelines/hooks/useGetPipeline';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUpdatePipeline } from '@/pipelines/hooks/useUpdatePipeline';
import { useEffect, useState, useRef, memo } from 'react';
import { UPDATE_PIPELINE_PERMISSIONS_FORM_SCHEMA } from '@/settings/schema/pipeline';
import { PermissionState, StatusItem } from '@/pipelines/types';
import { SelectMember } from 'ui-modules';
import { useGetTicketStatusesByPipeline } from '@/status/hooks/useGetTicketStatus';
import { useUpdateTicketStatus } from '@/status/hooks/useUpdateTicketStatus';
import { PermissionCheckbox } from './PermissionCheckbox';
import { StatusPermissionControl } from './StatusPermissionControl';
import { PipelineVisibility } from './PipelineVisibility';
import { VISIBILITY_RULES } from '../constant';

export const PipelinePermissionsList = memo(() => {
  const { pipelineId } = useParams<{ pipelineId: string }>();

  const { pipeline, loading: pipelineLoading } = useGetPipeline(pipelineId);
  const { statuses, loading: statusesLoading } =
    useGetTicketStatusesByPipeline();
  const { updatePipeline, loading: updating } = useUpdatePipeline();
  const { updateStatus } = useUpdateTicketStatus();

  const [visibleStatusCount, setVisibleStatusCount] = useState(5);
  const INITIAL_STATUS_COUNT = 5;

  const form = useForm<PermissionState>({
    resolver: zodResolver(UPDATE_PIPELINE_PERMISSIONS_FORM_SCHEMA),
    defaultValues: {
      _id: pipelineId,
      dayAfterCreated: false,
      branchOnly: false,
      myTicketsOnly: false,
      departmentOnly: false,
      allowAllUsers: true,
      selectedUsers: [],
      visibility: 'public',
      memberIds: [],
    },
  });

  const myTicketsOnly = form.watch('myTicketsOnly');

  const initialValuesRef = useRef<PermissionState | null>(null);
  const isUpdatingRef = useRef(false);

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
        allowAllUsers: true,
        selectedUsers: pipeline.excludeCheckUserIds || [],
        visibility: ((pipeline.visibility && pipeline.visibility.trim()) ||
          'public') as 'public' | 'private',
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

    const initialValues = initialValuesRef.current;

    const hasChanges =
      formValues.dayAfterCreated !== initialValues.dayAfterCreated ||
      formValues.branchOnly !== initialValues.branchOnly ||
      formValues.myTicketsOnly !== initialValues.myTicketsOnly ||
      formValues.departmentOnly !== initialValues.departmentOnly ||
      formValues.allowAllUsers !== initialValues.allowAllUsers ||
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
        .catch((error) => {
          console.error('Failed to update pipeline:', error);
        })
        .finally(() => {
          isUpdatingRef.current = false;
        });
    }
  }, [formValues, pipeline, pipelineId, updatePipeline]);

  if (pipelineLoading || statusesLoading || updating) {
    return (
      <div className="flex items-center justify-center p-10">
        <Spinner />
      </div>
    );
  }

  return (
    <Form {...form}>
      <div className="flex flex-col h-full min-h-0">
        <InfoCard
          className="flex flex-col flex-1 min-h-0"
          title="Pipeline Permissions"
          description="Configure who can view and manage tickets"
        >
          <InfoCard.Content
            className="flex-1 overflow-y-auto p-0 pb-24"
            style={{ minHeight: 0 }}
          >
            <div className="divide-y">
              <section className="p-6 space-y-6">
                <div>
                  <h3 className="text-base font-semibold">Visibility Rules</h3>
                  <p className="text-sm text-muted-foreground">
                    Control ticket visibility inside this pipeline
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {VISIBILITY_RULES.map((rule) => (
                    <Form.Field
                      key={rule.name}
                      control={form.control}
                      name={rule.name as any}
                      render={({ field }) => (
                        <PermissionCheckbox
                          field={field}
                          title={rule.title}
                          description={rule.description}
                        />
                      )}
                    />
                  ))}
                </div>
                {myTicketsOnly && (
                  <section className="p-6 bg-muted/20 space-y-4">
                    <h3 className="text-base font-semibold">User Access</h3>

                    <Form.Field
                      control={form.control}
                      name="selectedUsers"
                      render={({ field }) => (
                        <SelectMember.Provider
                          value={field.value || []}
                          onValueChange={(val) =>
                            field.onChange(val as string[])
                          }
                          mode="multiple"
                        >
                          <PopoverScoped>
                            <Combobox.Trigger className="w-full h-10 rounded-lg border bg-background">
                              <SelectMember.Value placeholder="Select team members" />
                            </Combobox.Trigger>
                            <Combobox.Content>
                              <SelectMember.Content />
                            </Combobox.Content>
                          </PopoverScoped>
                        </SelectMember.Provider>
                      )}
                    />
                  </section>
                )}
                <div className="pt-6 border-t">
                  <h4 className="text-sm font-medium mb-4">
                    Pipeline Visibility
                  </h4>
                  <PipelineVisibility control={form.control} />
                </div>
              </section>

              {statuses?.length > 0 && (
                <section className="p-6 space-y-4">
                  <h3 className="text-base font-semibold">
                    Status Permissions
                  </h3>

                  <div className="grid gap-4">
                    {statuses
                      .slice(0, visibleStatusCount)
                      .map((status: StatusItem) => (
                        <StatusPermissionControl
                          key={status.value}
                          status={status}
                          values={form.getValues()}
                          updateStatus={updateStatus}
                        />
                      ))}
                  </div>

                  {statuses.length > INITIAL_STATUS_COUNT && (
                    <div className="flex justify-center pt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (visibleStatusCount >= statuses.length) {
                            setVisibleStatusCount(INITIAL_STATUS_COUNT);
                          } else {
                            setVisibleStatusCount((prev) =>
                              Math.min(prev + 5, statuses.length),
                            );
                          }
                        }}
                      >
                        {visibleStatusCount >= statuses.length
                          ? 'Show Less'
                          : `Show ${Math.min(
                              5,
                              statuses.length - visibleStatusCount,
                            )} More`}
                      </Button>
                    </div>
                  )}
                </section>
              )}
            </div>
          </InfoCard.Content>
        </InfoCard>
      </div>
    </Form>
  );
});
