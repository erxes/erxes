import type { ProjectFieldsProps } from '@/project/types/projectFields';
import { Input, IconPicker, Separator, BlockEditor } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  SelectLead,
  DateSelect,
  SelectProjectTeam,
} from '@/project/components/select';
import {
  OperationMembersChip,
  OperationTagsChip,
} from '@/operation/components/OperationChips';
import { SelectProjectPriority } from '@/project/components/select/SelectProjectPriority';
import { ActivityList } from '@/activity/components/ActivityList';
import { SelectProjectStatus } from '@/project/components/select/SelectProjectStatus';
import { compactList } from '@/operation/utils/cursorList';
import { useProjectFieldsEditor } from '@/project/hooks/useProjectFieldsEditor';
import { ProjectContactsField } from './ProjectContactsField';

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
        <SelectProjectStatus
          value={status}
          projectId={projectId}
          label={t('status')}
        />
        <SelectProjectPriority
          projectId={projectId}
          value={priority}
          label={t('priority')}
        />
        <SelectLead.Detail
          value={leadId ?? undefined}
          id={projectId}
          teamIds={teamIds}
          label={t('lead')}
        />
        <DateSelect.Detail
          value={startDate}
          id={projectId}
          type="start"
          label={t('start-date')}
        />
        <DateSelect.Detail
          value={targetDate}
          id={projectId}
          type="target"
          label={t('target-date')}
        />
        <OperationMembersChip
          value={localMemberIds}
          onValueChange={(value) =>
            setLocalMemberIds(Array.isArray(value) ? value : [])
          }
          label={t('members')}
        />
        <SelectProjectTeam
          value={teamIds || []}
          projectId={projectId}
          variant="detail"
          label={t('team')}
        />
        <OperationTagsChip
          type="operation:project"
          value={tagIds ? compactList(tagIds) : []}
          onValueChange={handleTagsChange}
          label={t('tags')}
        />
        <ProjectContactsField
          projectId={projectId}
          kind="customer"
          value={project.customerId}
          label={t('customers', 'Customers')}
        />
        <ProjectContactsField
          projectId={projectId}
          kind="company"
          value={project.companyId}
          label={t('companies', 'Companies')}
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
