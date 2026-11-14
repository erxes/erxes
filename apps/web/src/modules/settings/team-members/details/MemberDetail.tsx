import type { User } from '@erxes/core-contract';
import { IconId, IconLink } from '@tabler/icons-react';
import { memberName, Skeleton, Spinner } from 'erxes-ui';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { AvatarEditor } from '~/components/AvatarEditor';
import { isApiError, messageOf } from '@erxes/core-contract/client';
import { MemberAvatar } from '../record/TeamMemberColumns';
import { useMemberPermissions, useTeamMember, useTeamMemberEdit } from '../useTeamMembers';
import { PanelMessage } from '~/modules/side-panel/SidePanelEmpty';
import { MemberLinks } from './MemberLinks';
import { MemberPanelActions } from './MemberPanelActions';
import { MemberPanelBreadcrumb } from './MemberPanelBreadcrumb';
import { MemberPanelDetail, MemberPanelName } from './MemberPanelDetail';
import {
  type IRecordSidePanelTab,
  RecordSidePanel,
  usePanelExpanded,
} from '~/modules/side-panel/RecordSidePanel';

const DETAIL_TAB = 'overview';

/** The member's name and picture; editable by whoever may edit the member. */
const useMemberHeading = (user: User | undefined, loading: boolean) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const permissions = useMemberPermissions(user);
  const edit = useTeamMemberEdit();
  const fallbackTitle = loading ? <Skeleton className="h-4 w-32" /> : t('member-detail');
  const name = user ? memberName(user) : null;
  const plainTitle = name ?? fallbackTitle;

  if (!user) {
    return {
      plainTitle,
      title: plainTitle,
      avatar: loading ? <Skeleton radius="circle" className="size-7 flex-none" /> : undefined,
    };
  }

  if (!permissions?.canEdit) {
    return {
      plainTitle,
      title: plainTitle,
      avatar: <MemberAvatar user={user} className="size-7 flex-none" />,
    };
  }

  return {
    plainTitle,
    title: <MemberPanelName user={user} />,
    avatar: (
      <AvatarEditor
        src={user.avatarUrl}
        name={name ?? undefined}
        onSave={(avatarUrl) => edit.mutate({ id: user.id, avatarUrl })}
      />
    ),
  };
};

/** Detail and Links; on the member's page, Detail is the left column. */
const MemberTabs = ({
  user,
  tab,
  onTabChange,
  overviewHeader,
}: {
  user: User;
  tab: string | null;
  onTabChange: (tab: string) => void;
  overviewHeader: ReactNode;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { t: panelT } = useTranslation('common', { keyPrefix: 'side-panel' });

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
  ];

  return (
    <RecordSidePanel.Tabs
      tabs={tabs}
      value={tab && tabs.some(({ value }) => value === tab) ? tab : DETAIL_TAB}
      onValueChange={onTabChange}
      overviewTab={DETAIL_TAB}
      overviewHeader={overviewHeader}
    />
  );
};

/** A member in a record panel: beside the list or as its own page. */
export const MemberDetail = ({
  memberId,
  tab,
  onTabChange,
  onExpand,
  onClose,
}: {
  memberId: string;
  tab: string | null;
  onTabChange: (tab: string) => void;
  onExpand?: () => void;
  onClose?: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const expanded = usePanelExpanded();
  const { data: user, error, isPending } = useTeamMember(memberId);
  const { title, plainTitle, avatar } = useMemberHeading(user, isPending);

  let body: ReactNode = (
    <PanelMessage title={t('member-not-found')} description={t('member-not-found-description')} />
  );

  if (isPending) body = <Spinner area="lg" />;
  else if (error && !isApiError(error, 'NOT_FOUND')) {
    body = <PanelMessage title={t('error')} description={messageOf(error)} />;
  } else if (user) {
    body = (
      <MemberTabs
        user={user}
        tab={tab}
        onTabChange={onTabChange}
        overviewHeader={
          <>
            {avatar && <div className="shrink-0">{avatar}</div>}
            <h2 className="min-w-0 flex-1 truncate text-sm font-semibold">{title}</h2>
          </>
        }
      />
    );
  }

  return (
    <>
      <RecordSidePanel.Header
        className={expanded ? 'h-10 bg-background px-3' : undefined}
        avatar={expanded ? undefined : avatar}
        title={expanded ? <MemberPanelBreadcrumb title={plainTitle} /> : title}
        actions={user && <MemberPanelActions user={user} />}
        onExpand={onExpand}
        onClose={onClose}
      />
      {body}
    </>
  );
};
