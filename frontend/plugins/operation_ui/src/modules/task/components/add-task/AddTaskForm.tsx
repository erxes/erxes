import {
  Form,
  Input,
  Sheet,
  Button,
  Separator,
  useBlockEditor,
  BlockEditor,
} from 'erxes-ui';
import { TAddTask, addTaskSchema } from '@/task/types';
import { useCreateTask } from '@/task/hooks/useCreateTask';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Block } from '@blocknote/core';
import { SelectProject } from '@/task/components/task-selects/SelectProjectTask';
import { useGetCurrentUsersTeams } from '@/team/hooks/useGetCurrentUsersTeams';
import { IconChevronRight } from '@tabler/icons-react';
import { useParams } from 'react-router-dom';
import { useAtom, useAtomValue } from 'jotai';
import { currentUserState } from 'ui-modules';
import { useGetProject } from '@/project/hooks/useGetProject';
import { SelectAssigneeTask } from '@/task/components/task-selects/SelectAssigneeTask';
import { SelectStatusTask } from '@/task/components/task-selects/SelectStatusTask';
import clsx from 'clsx';
import { TaskHotKeyScope } from '@/task/TaskHotkeyScope';
import { SelectPriority } from '@/operation/components/SelectPriority';
import { DateSelectTask } from '@/task/components/task-selects/DateSelectTask';
import { SelectEstimatedPoint } from '@/task/components/task-selects/SelectEstimatedPointTask';
import { SelectTeam } from '@/team/components/SelectTeam';
import { taskCreateDefaultValuesState } from '@/task/states/taskCreateSheetState';
import { SelectCycle } from '@/task/components/task-selects/SelectCycle';

export const AddTaskForm = ({ onClose }: { onClose: () => void }) => {
  const { teamId, projectId, cycleId } = useParams<{
    teamId?: string;
    projectId?: string;
    cycleId?: string;
  }>();

  const { teams } = useGetCurrentUsersTeams();
  const currentUser = useAtomValue(currentUserState);
  const { createTask, loading: createTaskLoading } = useCreateTask();
  const [descriptionContent, setDescriptionContent] = useState<Block[]>();
  const editor = useBlockEditor();
  const [defaultValuesState, setDefaultValues] = useAtom(
    taskCreateDefaultValuesState,
  );

  const { project } = useGetProject({
    variables: { _id: projectId || '' },
    skip: !projectId,
  });

  const [_teamId, _setTeamId] = useState<string | undefined>(
    teamId ? teamId : project?.teamIds?.[0] ? project?.teamIds?.[0] : undefined,
  );

  const defaultValues = {
    teamId: _teamId || undefined,
    name: '',
    priority: 0,
    assigneeId: teamId ? undefined : currentUser?._id,
    projectId: projectId || undefined,
    startDate: undefined,
    targetDate: undefined,
    estimatePoint: 0,
    cycleId: cycleId,
  };

  const form = useForm<TAddTask>({
    resolver: zodResolver(addTaskSchema),
    defaultValues,
  });

  useEffect(() => {
    form.setFocus('name');
  }, [form]);

  useEffect(() => {
    if (teams && teams.length > 0 && !form.getValues('teamId') && !teamId) {
      form.setValue('teamId', teams[0]._id);
      _setTeamId(teams[0]._id);
    }
  }, [teams, form, teamId, currentUser]);

  useEffect(() => {
    if (defaultValuesState) {
      form.reset({ ...defaultValues, ...defaultValuesState });
      setDefaultValues(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValuesState, form, setDefaultValues]);

  const handleDescriptionChange = async () => {
    const content = await editor?.document;
    if (content) {
      content.pop();
      setDescriptionContent(content as Block[]);
    }
  };

  const onSubmit = async (data: TAddTask) => {
    createTask({
      variables: {
        ...data,
        description: JSON.stringify(descriptionContent),
        priority: data.priority || 0,
        status: data.status,
      },
      onCompleted: () => {
        onClose();
      },
    });
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.log(errors);
        })}
        className="h-full flex flex-col"
      >
        <Sheet.Header className="flex items-center gap-2 ">
          <Form.Field
            name="teamId"
            control={form.control}
            render={({ field }) => (
              <Form.Item className="space-y-0">
                <Form.Label className="sr-only">Team</Form.Label>
                <SelectTeam.FormItem
                  value={field.value || ''}
                  onValueChange={(value) => {
                    field.onChange(value);
                    form.resetField('projectId');
                    form.resetField('status');
                    form.resetField('cycleId');
                  }}
                  mode="single"
                />
              </Form.Item>
            )}
          />
          <IconChevronRight className="size-4" />
          <Sheet.Title className="">New task</Sheet.Title>
        </Sheet.Header>
        <Sheet.Content className="px-7 py-4 gap-2 flex flex-col min-h-0">
          <Form.Field
            name="name"
            control={form.control}
            render={({ field }) => (
              <Form.Item>
                <Form.Label className="sr-only">Name</Form.Label>
                <Form.Control>
                  <Input
                    {...field}
                    className="shadow-none focus-visible:shadow-none h-8 text-xl p-0"
                    placeholder="Task Name"
                  />
                </Form.Control>
              </Form.Item>
            )}
          />
          <div className="flex gap-2 w-full flex-wrap">
            <Form.Field
              name="status"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="sr-only">Status</Form.Label>
                  <SelectStatusTask.FormItem
                    value={field.value || ''}
                    onValueChange={(value) => field.onChange(value)}
                    form={form}
                  />
                </Form.Item>
              )}
            />
            <Form.Field
              name="priority"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="sr-only">Priority</Form.Label>
                  <SelectPriority.FormItem
                    value={field.value || 0}
                    onValueChange={(value) => field.onChange(value)}
                  />
                </Form.Item>
              )}
            />
            <Form.Field
              name="assigneeId"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="sr-only">Assignee</Form.Label>
                  <SelectAssigneeTask.FormItem
                    value={field.value || ''}
                    onValueChange={(value: any) => {
                      field.onChange(value);
                    }}
                    teamIds={form.getValues('teamId') || _teamId}
                  />
                </Form.Item>
              )}
            />
            <Form.Field
              name="projectId"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="sr-only">Project</Form.Label>
                  <SelectProject.FormItem
                    value={field.value || ''}
                    onValueChange={(value: any) => {
                      field.onChange(value);
                    }}
                    teamId={form.getValues('teamId') || undefined}
                  />
                </Form.Item>
              )}
            />
            <Form.Field
              name="estimatePoint"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="sr-only">Estimate Point</Form.Label>
                  <SelectEstimatedPoint.FormItem
                    value={field.value || 0}
                    onValueChange={(value) => field.onChange(value)}
                    teamId={form.getValues('teamId') || _teamId || ''}
                    scope={clsx(
                      TaskHotKeyScope.TasksPage,
                      'form',
                      'Estimate Point',
                    )}
                  />
                </Form.Item>
              )}
            />
            <Form.Field
              name="cycleId"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="sr-only">Cycle</Form.Label>
                  <SelectCycle.FormItem
                    value={field.value || ''}
                    onValueChange={(value: any) => {
                      field.onChange(value);
                    }}
                    teamId={form.getValues('teamId') || undefined}
                  />
                </Form.Item>
              )}
            />
            <Form.Field
              name="startDate"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="sr-only">Start Date</Form.Label>
                  <DateSelectTask.FormItem
                    value={field.value}
                    placeholder="Start Date"
                    onValueChange={(value) => field.onChange(value)}
                  />
                </Form.Item>
              )}
            />
            <Form.Field
              name="targetDate"
              control={form.control}
              render={({ field }) => (
                <Form.Item>
                  <Form.Label className="sr-only">Target Date</Form.Label>
                  <DateSelectTask.FormItem
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                    placeholder="Target Date"
                  />
                </Form.Item>
              )}
            />
          </div>
          <Separator className="my-4" />
          <div className="flex-1 overflow-y-auto">
            <BlockEditor
              editor={editor}
              onChange={handleDescriptionChange}
              className="read-only min-h-full"
            />
          </div>
        </Sheet.Content>
        <Sheet.Footer className="flex justify-end flex-shrink-0 gap-1 px-5">
          <Button
            type="button"
            variant="ghost"
            className="bg-background hover:bg-background/90"
            onClick={() => {
              onClose();
              form.reset();
              editor?.removeBlocks(editor?.document);
              setDescriptionContent(undefined);
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={createTaskLoading}
          >
            Save
          </Button>
        </Sheet.Footer>
      </form>
    </Form>
  );
};
