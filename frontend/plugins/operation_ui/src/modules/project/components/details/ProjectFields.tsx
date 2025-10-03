import {
  Input,
  IconPicker,
  Separator,
  useBlockEditor,
  BlockEditor,
} from 'erxes-ui';
import { useUpdateProject } from '@/project/hooks/useUpdateProject';
import { useDebounce } from 'use-debounce';
import { useEffect, useState } from 'react';
import { Block } from '@blocknote/core';
import {
  SelectLead,
  DateSelect,
  SelectProjectTeam,
} from '@/project/components/select';
import { useGetProject } from '@/project/hooks/useGetProject';
import { SelectProjectPriority } from '@/project/components/select/SelectProjectPriority';
import { ActivityList } from '@/activity/components/ActivityList';
import { SelectProjectStatus } from '@/project/components/select/SelectProjectStatus';

export const ProjectFields = ({ projectId }: { projectId: string }) => {
  const { project } = useGetProject({
    variables: { _id: projectId },
  });

  const {
    teamIds,
    priority,
    icon,
    status,
    leadId,
    name: _name,
    startDate,
    targetDate,
    description,
  } = project || {};

  const [descriptionContent, setDescriptionContent] = useState<
    Block[] | undefined
  >(description ? JSON.parse(description) : undefined);
  const editor = useBlockEditor({
    initialContent: descriptionContent,
    placeholder: 'Description...',
  });
  const { updateProject } = useUpdateProject();

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
    updateProject({
      variables: {
        _id: projectId,
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
    updateProject({
      variables: {
        _id: projectId,
        description: JSON.stringify(debouncedDescriptionContent),
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedDescriptionContent]);
  if (!project) return null;

  return (
    <div className="flex flex-col gap-3">
      <IconPicker
        variant="secondary"
        size="icon"
        className="w-min p-2"
        value={icon}
        onValueChange={(_icon) => {
          if (_icon !== icon) {
            updateProject({ variables: { _id: projectId, icon: _icon } });
          }
        }}
      />
      <Input
        className="shadow-none focus-visible:shadow-none h-8 text-xl p-0"
        placeholder="Project Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="gap-2 flex flex-wrap w-full">
        <SelectProjectStatus value={status} projectId={projectId} />
        <SelectProjectPriority projectId={projectId} value={priority} />
        <SelectLead.Detail value={leadId} id={projectId} teamIds={teamIds} />
        <DateSelect.Detail value={startDate} id={projectId} type="start" />
        <DateSelect.Detail value={targetDate} id={projectId} type="target" />
        <SelectProjectTeam
          value={teamIds || []}
          projectId={projectId}
          variant="detail"
        />
      </div>
      <Separator className="my-4" />
      <div className="min-h-56 overflow-y-auto">
        <BlockEditor
          editor={editor}
          onChange={handleDescriptionChange}
          className="min-h-full read-only"
        />
      </div>
      <ActivityList contentId={projectId} contentDetail={project} />
    </div>
  );
};
