import type { ProjectFieldsProps } from '@/project/types/projectFields';
import { Input, IconPicker, Separator, BlockEditor } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  SelectLead,
  DateSelect,
  SelectProjectTeam,
} from '@/project/components/select';
import { SelectProjectPriority } from '@/project/components/select/SelectProjectPriority';
import { ActivityList } from '@/activity/components/ActivityList';
import { SelectProjectStatus } from '@/project/components/select/SelectProjectStatus';
import { SelectTags, SelectMember } from 'ui-modules';
import { compactList } from '@/operation/utils/cursorList';
import { useProjectFieldsEditor } from '@/project/hooks/useProjectFieldsEditor';

export const ProjectFields = ({
  projectId,
  titleAction,
}: ProjectFieldsProps) => {
  const { t } = useTranslation('operation');
  const {
    project,
    editor,
    name,
    setName,
    localMemberIds,
    setLocalMemberIds,
    handleDescriptionChange,
    handleIconChange,
    handleTagsChange,
  } = useProjectFieldsEditor({
    projectId,
    descriptionPlaceholder: t('description-placeholder'),
  });
  const {
    teamIds,
    priority,
    icon,
    status,
    leadId,
    startDate,
    targetDate,
    tagIds,
  } = project || {};
  if (!project) return null;

  return (
    <div className="flex flex-col gap-3">
      <IconPicker
        variant="secondary"
        size="icon"
        className="w-min p-2"
        value={icon ?? undefined}
        onValueChange={handleIconChange}
      />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <Input
            className="shadow-none focus-visible:shadow-none h-8 text-xl p-0"
            placeholder={t('project-name')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        {titleAction}
      </div>
      <div className="gap-2 flex flex-wrap w-full">
        <SelectProjectStatus value={status} projectId={projectId} />
        <SelectProjectPriority projectId={projectId} value={priority} />
        <SelectLead.Detail
          value={leadId ?? undefined}
          id={projectId}
          teamIds={teamIds}
        />
        <DateSelect.Detail value={startDate} id={projectId} type="start" />
        <DateSelect.Detail value={targetDate} id={projectId} type="target" />
        <SelectMember.CustomDetail
          value={localMemberIds}
          onValueChange={(value) => {
            setLocalMemberIds(value as string[]);
          }}
          mode="multiple"
          size="lg"
        />
        <SelectProjectTeam
          value={teamIds || []}
          projectId={projectId}
          variant="detail"
        />
        <SelectTags.Detail
          value={tagIds ? compactList(tagIds) : []}
          tagType="operation:project"
          onValueChange={handleTagsChange}
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
