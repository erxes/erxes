import {
  ProgressBreakdownRow,
  TScopeProgress,
} from '@/operation/components/progress/ScopeProgress';
import { useGetProjectProgressByMember } from '@/project/hooks/useGetProjectProgressByMember';
import { useTranslation } from 'react-i18next';
import { MembersInline } from 'ui-modules';

// Shared by project and cycle progress: one row per assignee.
export const ProgressByMemberList = ({
  items,
}: {
  items: (TScopeProgress & { assigneeId?: string | null })[];
}) => {
  const { t } = useTranslation('operation');

  return (
    <div className="space-y-1">
      {items.map((item) => (
        <ProgressBreakdownRow
          key={item.assigneeId ?? 'unassigned'}
          item={item}
          label={
            <MembersInline
              memberIds={item.assigneeId ? [item.assigneeId] : []}
              placeholder={t('no-assignee')}
            />
          }
        />
      ))}
    </div>
  );
};

export const ProgressByMember = ({ projectId }: { projectId: string }) => {
  const { projectProgressByMember } = useGetProjectProgressByMember(projectId);

  return <ProgressByMemberList items={projectProgressByMember ?? []} />;
};
