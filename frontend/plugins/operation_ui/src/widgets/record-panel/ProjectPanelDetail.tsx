import { SelectProjectPriority } from '@/project/components/select/SelectProjectPriority';
import { SelectProjectStatus } from '@/project/components/select/SelectProjectStatus';
import { SelectProjectTeam } from '@/project/components/select/SelectProjectTeam';
import { DateSelect, SelectLead } from '@/project/components/select';
import { PROJECT_CONTENT_TYPE } from '@/project/constants/contentType';
import { useUpdateProject } from '@/project/hooks/useUpdateProject';
import { IProjectDetail } from '@/project/types';
import { compactList } from '@/operation/utils/cursorList';
import {
  IconBuilding,
  IconCalendar,
  IconCalendarDue,
  IconCircleCheck,
  IconFlag,
  IconPhoto,
  IconTags,
  IconUser,
  IconUsers,
  IconUsersGroup,
} from '@tabler/icons-react';
import { IconPicker, ScrollArea } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { type ReactNode, useRef, useState } from 'react';
import { PanelField, SelectMember, TagsSelect } from 'ui-modules';
import { RecordContactsField } from './RecordContactsField';
import { RecordDescriptionField } from './RecordDescriptionField';

const ProjectFields = ({ project }: { project: IProjectDetail }) => {
  const { t } = useTranslation('operation');
  const { updateProject } = useUpdateProject();
  const { _id, teamIds } = project;
  const scope = `side-panel-project.${_id}`;
  const [localMemberIds, setLocalMemberIds] = useState<string[] | null>(null);
  const memberSaveQueue = useRef<Promise<unknown>>(Promise.resolve());
  const latestMemberSave = useRef(0);

  const updateMembers = (value: string[] | string | null): void => {
    const memberIds = Array.isArray(value) ? value : [];
    const requestId = ++latestMemberSave.current;
    setLocalMemberIds(memberIds);
    // Serialize full-list updates so an older save cannot overwrite a newer one.
    memberSaveQueue.current = memberSaveQueue.current
      .then(() => updateProject({ variables: { _id, memberIds } }))
      .catch(() => undefined)
      .finally(() => {
        if (requestId === latestMemberSave.current) setLocalMemberIds(null);
      });
  };

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <PanelField icon={IconPhoto} label={t('icon')} cell={false}>
        <IconPicker
          value={project.icon ?? undefined}
          variant="ghost"
          size="icon"
          className="size-7"
          onValueChange={(icon) => updateProject({ variables: { _id, icon } })}
        />
      </PanelField>
      <PanelField icon={IconCircleCheck} label={t('status')}>
        <SelectProjectStatus
          projectId={_id}
          value={project.status}
          inInlineCell
        />
      </PanelField>
      <PanelField icon={IconFlag} label={t('priority')}>
        <SelectProjectPriority
          projectId={_id}
          value={project.priority}
          inInlineCell
        />
      </PanelField>
      <PanelField icon={IconUser} label={t('lead')}>
        <SelectLead.InlineCell
          id={_id}
          value={project.leadId}
          teamIds={teamIds}
          scope={`${scope}.lead`}
        />
      </PanelField>
      <PanelField icon={IconUsers} label={t('members')}>
        <SelectMember.InlineCell
          mode="multiple"
          value={localMemberIds ?? compactList(project.memberIds)}
          scope={`${scope}.members`}
          placeholder={t('members-not-specified')}
          onValueChange={updateMembers}
        />
      </PanelField>
      <PanelField icon={IconCalendar} label={t('start-date')}>
        <DateSelect.InlineCell
          id={_id}
          type="start"
          value={project.startDate}
          scope={`${scope}.startDate`}
        />
      </PanelField>
      <PanelField icon={IconCalendarDue} label={t('target-date')}>
        <DateSelect.InlineCell
          id={_id}
          type="target"
          value={project.targetDate}
          scope={`${scope}.targetDate`}
        />
      </PanelField>
      <PanelField icon={IconUsersGroup} label={t('team')}>
        <SelectProjectTeam projectId={_id} value={teamIds} variant="table" />
      </PanelField>
      <PanelField icon={IconTags} label={t('tags')}>
        <TagsSelect.InlineCell
          type={PROJECT_CONTENT_TYPE}
          mode="multiple"
          value={compactList(project.tagIds)}
          scope={`${scope}.tags`}
          onValueChange={(value) =>
            updateProject({
              variables: {
                _id,
                tagIds: Array.isArray(value) ? value : [value],
              },
            })
          }
        />
      </PanelField>
      <PanelField icon={IconUsers} label={t('customer', 'Customer')}>
        <RecordContactsField
          kind="customer"
          value={project.customerId}
          scope={`${scope}.customer`}
          onValueChange={(customerId) =>
            updateProject({
              variables: { _id, customerId },
              update: (cache) =>
                cache.evict({ id: 'ROOT_QUERY', fieldName: 'getProjects' }),
            })
          }
        />
      </PanelField>
      <PanelField icon={IconBuilding} label={t('company', 'Company')}>
        <RecordContactsField
          kind="company"
          value={project.companyId}
          scope={`${scope}.company`}
          onValueChange={(companyId) =>
            updateProject({
              variables: { _id, companyId },
              update: (cache) =>
                cache.evict({ id: 'ROOT_QUERY', fieldName: 'getProjects' }),
            })
          }
        />
      </PanelField>
    </div>
  );
};

const ProjectDescription = ({
  project,
  bare = false,
}: {
  project: IProjectDetail;
  bare?: boolean;
}) => {
  const { updateProject } = useUpdateProject();
  return (
    <RecordDescriptionField
      key={project._id}
      value={project.description}
      bare={bare}
      onSave={(description) =>
        updateProject({ variables: { _id: project._id, description } })
      }
    />
  );
};

const ProjectScroll = ({
  className,
  children,
}: {
  className: string;
  children: ReactNode;
}) => (
  <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
    <div className={className}>{children}</div>
  </ScrollArea>
);

export const ProjectPanelDetail = ({
  project,
}: {
  project: IProjectDetail;
}) => (
  <ProjectScroll className="grid gap-5 p-3 @3xl/record-panel:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)] @3xl/record-panel:p-6">
    <ProjectFields key={project._id} project={project} />
    <ProjectDescription project={project} />
  </ProjectScroll>
);

export const ProjectPageFields = ({ project }: { project: IProjectDetail }) => (
  <ProjectScroll className="p-3">
    <ProjectFields key={project._id} project={project} />
  </ProjectScroll>
);

export const ProjectPageDescription = ({
  project,
}: {
  project: IProjectDetail;
}) => (
  <ProjectScroll className="w-full xl:max-w-3xl mx-auto p-6">
    <ProjectDescription project={project} bare />
  </ProjectScroll>
);
