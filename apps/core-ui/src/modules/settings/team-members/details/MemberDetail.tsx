import { IconId, IconLink } from '@tabler/icons-react';
import { isApiError, messageOf } from '~/lib/api';
import { Skeleton, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { MemberAvatar } from '../record/TeamMemberColumns';
import { memberName, useMemberPermissions, useTeamMember } from '../useTeamMembers';
import { MemberDetailEmptyState, MemberDetailErrorState } from './MemberDetailStates';
import { MemberLinks } from './MemberLinks';
import { MemberPanelActions } from './MemberPanelActions';
import { MemberPanelBreadcrumb } from './MemberPanelBreadcrumb';
import { MemberPanelDetail, MemberPanelName } from './MemberPanelDetail';
import { type IRecordSidePanelTab, RecordSidePanel, usePanelExpanded } from './RecordSidePanel';

const DETAIL_TAB = 'overview';

/**
 * A member in a record panel (old `MemberDetail`): beside the list or as its
 * own page. Permissions, properties, sessions, active time and activity tabs
 * are left out (core has none of them yet).
 */
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
  const { t: panelT } = useTranslation('common', { keyPrefix: 'side-panel' });
  const expanded = usePanelExpanded();
  const { data: user, error, isPending } = useTeamMember(memberId);
  const permissions = useMemberPermissions(user);

  const fallbackTitle = isPending ? <Skeleton className="h-4 w-32" /> : t('member-detail');
  const name = user ? memberName(user) : null;
  const title =
    user && permissions?.canEdit ? <MemberPanelName user={user} /> : (name ?? fallbackTitle);
  const avatar = user ? (
    <MemberAvatar user={user} className="size-7 flex-none" />
  ) : isPending ? (
    <Skeleton className="size-7 flex-none rounded-full" />
  ) : undefined;

  const renderBody = () => {
    if (isPending) return <Spinner containerClassName="py-12" />;
    if (error && !isApiError(error, 'NOT_FOUND'))
      return <MemberDetailErrorState message={messageOf(error)} />;
    if (!user) return <MemberDetailEmptyState />;

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
        value={tabs.some(({ value }) => value === tab) ? (tab ?? DETAIL_TAB) : DETAIL_TAB}
        onValueChange={onTabChange}
        overviewTab={DETAIL_TAB}
        overviewHeader={
          <>
            {avatar && <div className="shrink-0">{avatar}</div>}
            <h2 className="min-w-0 flex-1 truncate text-sm font-semibold">{title}</h2>
          </>
        }
      />
    );
  };

  return (
    <>
      <RecordSidePanel.Header
        className={expanded ? 'h-10 bg-background px-3' : undefined}
        avatar={expanded ? undefined : avatar}
        title={expanded ? <MemberPanelBreadcrumb title={name ?? fallbackTitle} /> : title}
        actions={user && <MemberPanelActions user={user} />}
        onExpand={onExpand}
        onClose={onClose}
      />
      {renderBody()}
    </>
  );
};
