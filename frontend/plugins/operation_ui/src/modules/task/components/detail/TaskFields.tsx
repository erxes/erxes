import { ActivityList } from '@/activity/components/ActivityList';
import { ConvertToProject } from '@/task/components/task-selects/ConvertToProject';
import { DateSelectTask } from '@/task/components/task-selects/DateSelectTask';
import { SelectAssigneeTask } from '@/task/components/task-selects/SelectAssigneeTask';
import { SelectCycle } from '@/task/components/task-selects/SelectCycle';
import { SelectEstimatedPoint } from '@/task/components/task-selects/SelectEstimatedPointTask';
import { SelectMilestone } from '@/task/components/task-selects/SelectMilestone';
import { SelectProject } from '@/task/components/task-selects/SelectProjectTask';
import { SelectStatusTask } from '@/task/components/task-selects/SelectStatusTask';
import { SelectTaskPriority } from '@/task/components/task-selects/SelectTaskPriority';
import { SelectTeamTask } from '@/task/components/task-selects/SelectTeamTask';
import { useUpdateTask } from '@/task/hooks/useUpdateTask';
import { ITask } from '@/task/types';
import { Block } from '@blocknote/core';
import { BlockEditor, Input, Separator, useBlockEditor } from 'erxes-ui';
import { useEffect, useState } from 'react';
import { useDebounce } from 'use-debounce';

export const TaskFields = ({ task }: { task: ITask }) => {
  const {
    _id: taskId,
    teamId,
    priority,
    status,
    assigneeId,
    name: _name,
    targetDate,
    projectId,
    estimatePoint,
    cycleId,
    milestoneId,
  } = task || {};

  const startDate = (task as any)?.startDate;
  const description = (task as any)?.description;
  const parsedDescription = description ? JSON.parse(description) : undefined;
  const initialDescriptionContent =
    Array.isArray(parsedDescription) && parsedDescription.length > 0
      ? parsedDescription
      : undefined;

  const [descriptionContent, setDescriptionContent] = useState<
    Block[] | undefined
  >(initialDescriptionContent);

  const editor = useBlockEditor({
    initialContent: descriptionContent,
    placeholder: 'Description...',
  });
  const { updateTask } = useUpdateTask();
  const [name, setName] = useState(_name);

  const handleDescriptionChange = async () => {
    const content = await editor?.document;
    if (content) {
      content.pop();
      setDescriptionContent(content as Block[]);
    }
  };

  const [debouncedDescriptionContent] = useDebounce(descriptionContent, 1000);
  const [debouncedName] = useDebounce(name, 1000);

  useEffect(() => {
    if (!debouncedName || debouncedName === _name) return;
    updateTask({
      variables: {
        _id: taskId,
        name: debouncedName,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedName]);
  useEffect(() => {
    if (!debouncedDescriptionContent) return;
    if (
      JSON.stringify(debouncedDescriptionContent) ===
      JSON.stringify(description ? JSON.parse(description) : undefined)
    ) {
      return;
    }
    updateTask({
      variables: {
        _id: taskId,
        description: JSON.stringify(debouncedDescriptionContent),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDescriptionContent]);
  return (
    <div className="flex flex-col gap-3">
      <Input
        className="shadow-none focus-visible:shadow-none h-8 text-xl p-0"
        placeholder="Task Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="gap-2 flex flex-wrap w-full">
        <SelectStatusTask
          variant="detail"
          value={status}
          id={taskId}
          teamId={teamId}
        />
        <SelectTaskPriority taskId={taskId} value={priority} variant="detail" />
        <SelectAssigneeTask
          variant="detail"
          value={assigneeId}
          id={taskId}
          teamIds={teamId ? [teamId] : undefined}
        />
        <DateSelectTask
          value={startDate ? new Date(startDate) : undefined}
          id={taskId}
          type="startDate"
          variant="detail"
        />
        <DateSelectTask
          value={targetDate ? new Date(targetDate) : undefined}
          id={taskId}
          type="targetDate"
          variant="detail"
        />
        <SelectTeamTask taskId={taskId} value={teamId || ''} variant="detail" />
        <SelectCycle
          value={cycleId || ''}
          taskId={taskId}
          variant="detail"
          teamId={teamId}
        />

        <SelectProject
          value={projectId}
          taskId={taskId}
          variant="detail"
          teamId={teamId}
        />
        <SelectEstimatedPoint
          value={estimatePoint}
          taskId={taskId}
          teamId={teamId}
          variant="detail"
        />
        <SelectMilestone
          value={milestoneId || ''}
          taskId={taskId}
          projectId={projectId}
          variant="detail"
        />
        <ConvertToProject task={task} />
      </div>
      <Separator className="my-4" />
      <div className="min-h-56 overflow-y-auto">
        <BlockEditor
          editor={editor}
          onChange={handleDescriptionChange}
          className="min-h-full read-only"
        />
      </div>
      <ActivityList contentId={taskId} contentDetail={task} />
    </div>
  );
};
