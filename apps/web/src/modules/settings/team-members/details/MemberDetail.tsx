import type { User } from '@erxes/core-contract';
import { IconHistory, IconId, IconLink } from '@tabler/icons-react';
import { memberName, Skeleton, usePanelExpanded } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { AvatarEditor } from '~/components/AvatarEditor';
import { RecordPageHeader } from '~/modules/side-panel/RecordPageHeader';
import { type IRecordSidePanelTab, RecordSidePanel } from '~/modules/side-panel/RecordSidePanel';
import type { IRecordViewProps } from '~/modules/side-panel/recordView';
import { SidePanelFailed } from '~/modules/side-panel/SidePanelEmpty';
import { useSidePanel } from '~/modules/side-panel/useSidePanel';
import { MemberAvatar } from '../record/TeamMemberColumns';
import { useMemberPermissions, useTeamMember, useTeamMemberEdit } from '../useTeamMembers';
import { MemberActivity } from './MemberActivity';
import { MemberLinks } from './MemberLinks';
import { MemberPanelActions } from './MemberPanelActions';
import { MemberPanelBreadcrumb } from './MemberPanelBreadcrumb';
import { MemberPanelDetail, MemberPanelName } from './MemberPanelDetail';

const DETAIL_TAB = 'detail';
const ACTIVITY_TAB = 'activity';

/** The member's name and picture; editable by whoever may edit the member. */
const useMemberHeading = (user: User) => {
  const permissions = useMemberPermissions(user);
  const edit = useTeamMemberEdit();

  if (!permissions?.canEdit) {
    return {
      title: memberName(user),
      avatar: <MemberAvatar user={user} className="size-7 flex-none" />,
    };
  }

  return {
    title: <MemberPanelName user={user} />,
    avatar: (
      <AvatarEditor
        src={user.avatarUrl}
        name={memberName(user)}
        onSave={(avatarUrl) => edit.mutate({ id: user.id, avatarUrl })}
      />
    ),
  };
};

/** A loaded member: header, then Detail, Links and Activity. */
const MemberView = ({
  user,
  onBack,
  onClose,
}: Omit<IRecordViewProps, 'record'> & { user: User }) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { t: panelT } = useTranslation('common', { keyPrefix: 'side-panel' });
  const expanded = usePanelExpanded();
  const { tab: selectedTab, setTab } = useSidePanel();
  const { title, avatar } = useMemberHeading(user);

  const tabs: IRecordSidePanelTab[] = [
    {
      value: DETAIL_TAB,
      label: panelT('detail', 'Detail'),
      icon: IconId,
      content: <MemberPanelDetail user={user} />,
    },
    {
      value: 'links',
      label: t('links', 'Links'),
      icon: IconLink,
      content: <MemberLinks user={user} />,
    },
    {
      value: ACTIVITY_TAB,
      label: panelT('activity', 'Activity'),
      icon: IconHistory,
      content: <MemberActivity memberId={user.id} />,
    },
  ];

  const tab =
    selectedTab && tabs.some((entry) => entry.value === selectedTab) ? selectedTab : DETAIL_TAB;

  const actions = <MemberPanelActions user={user} />;

  return (
    <>
      {expanded ? (
        <RecordPageHeader
          breadcrumb={<MemberPanelBreadcrumb title={memberName(user)} />}
          actions={actions}
        />
      ) : (
        <RecordSidePanel.Header
          avatar={avatar}
          title={title}
          actions={actions}
          onBack={onBack}
          onClose={onClose}
        />
      )}
      <RecordSidePanel.Layout
        tabs={tabs}
        value={tab}
        onValueChange={setTab}
        overviewTab={DETAIL_TAB}
        overviewHeader={
          <>
            <div className="shrink-0">{avatar}</div>
            <h2 className="min-w-0 flex-1 truncate text-sm font-semibold">{title}</h2>
          </>
        }
        expandedDefaultTab={ACTIVITY_TAB}
      />
    </>
  );
};

/** A team member in core's side panel (`core:user`), or on their own page. */
export const MemberDetail = ({ record, onBack, onClose }: IRecordViewProps) => {
  const { data: user, error, isPending } = useTeamMember(record.contentId);

  if (user) return <MemberView user={user} onBack={onBack} onClose={onClose} />;

  if (isPending) {
    return (
      <RecordSidePanel.Header
        avatar={<Skeleton radius="circle" className="size-7 flex-none" />}
        title={<Skeleton className="h-4 w-32" />}
        onBack={onBack}
        onClose={onClose}
      />
    );
  }

  return <SidePanelFailed error={error} onBack={onBack} onClose={onClose} />;
};
