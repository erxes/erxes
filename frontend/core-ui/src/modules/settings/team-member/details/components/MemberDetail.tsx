import { ContactPanelIdentity } from '@/side-panel/components/details/ContactPanelActions';
import { MemberPanelBreadcrumb } from './MemberPanelBreadcrumb';
import { memberCustomActivities } from '@/settings/team-member/details/components/MemberActivityRows';
import { MemberDetailEmptyState } from '@/settings/team-member/details/components/MemberDetailEmptyState';
import { MemberDetailErrorState } from '@/settings/team-member/details/components/MemberDetailErrorState';
import { MemberLinks } from '@/settings/team-member/details/components/MemberLinks';
import { MemberPanelActions } from '@/settings/team-member/details/components/MemberPanelActions';
import {
  MemberPanelDetail,
  MemberPanelName,
} from '@/settings/team-member/details/components/MemberPanelDetail';
import { MembersPermissions } from '@/settings/team-member/details/components/MembersPermissions';
import { useUserDetail } from '@/settings/team-member/hooks/useUserDetail';
import { useUserCustomFieldEdit } from '@/settings/team-member/hooks/useUserEdit';
import { MemberSessions } from '@/settings/team-member/sessions/components/MemberSessions';
import { MemberActivityTime } from '@/settings/team-member/activity/components/MemberActivityTime';
import {
  IconActivity,
  IconDeviceDesktop,
  IconHierarchy2,
  IconHistory,
  IconId,
  IconLink,
  IconShieldLock,
} from '@tabler/icons-react';
import { Avatar, readImage, ScrollArea, Skeleton, Spinner } from 'erxes-ui';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import {
  ActivityLogs,
  currentUserState,
  FieldsInDetail,
  IRecordSidePanelTab,
  RecordSidePanel,
  usePermissionCheck,
  useSidePanel,
  usePanelExpanded,
} from 'ui-modules';

const DETAIL_TAB = 'overview';

const MemberPanelScroll = ({ children }: { children: React.ReactNode }) => (
  <ScrollArea className="flex-1 min-h-0" viewportClassName="[&>div]:block!">
    {children}
  </ScrollArea>
);

export const MemberDetail = ({
  onBack,
  onClose,
}: {
  onBack?: () => void;
  onClose?: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { t: panelT } = useTranslation('common', { keyPrefix: 'side-panel' });
  const { tab: selectedTab, setTab: setSelectedTab } = useSidePanel();
  const expanded = usePanelExpanded();
  const { error, userDetail, loading } = useUserDetail();
  const { hasActionPermission } = usePermissionCheck();
  const currentUser = useAtomValue(currentUserState);

  const renderHeading = () => {
    if (!userDetail) {
      const title = loading ? (
        <Skeleton className="h-4 w-32" />
      ) : (
        t('member-detail')
      );
      return {
        title,
        breadcrumbTitle: title,
        avatar: loading ? (
          <Skeleton className="size-7 flex-none rounded-full" />
        ) : undefined,
      };
    }

    const { firstName, middleName, lastName, avatar } =
      userDetail.details || {};
    const title =
      [firstName, middleName, lastName].filter(Boolean).join(' ') ||
      userDetail.email ||
      t('member-detail');

    return {
      breadcrumbTitle: title,
      title: currentUser?.isOwner ? (
        <MemberPanelName userId={userDetail._id} />
      ) : (
        title
      ),
      avatar: (
        <Avatar size="lg" className="size-7 flex-none">
          <Avatar.Image src={readImage(avatar || '')} />
          <Avatar.Fallback>{title.charAt(0)}</Avatar.Fallback>
        </Avatar>
      ),
    };
  };

  const { title, avatar, breadcrumbTitle } = renderHeading();

  const renderBody = () => {
    if (loading && !userDetail) {
      return <Spinner containerClassName="py-12" />;
    }

    if (error) {
      return <MemberDetailErrorState />;
    }

    if (!userDetail) {
      return <MemberDetailEmptyState />;
    }

    const tabs: IRecordSidePanelTab[] = [
      {
        value: DETAIL_TAB,
        label: panelT('detail', 'Detail'),
        icon: IconId,
        content: <MemberPanelDetail />,
      },
      {
        value: 'permissions',
        label: t('permissions', 'Permissions'),
        icon: IconShieldLock,
        content: (
          <MemberPanelScroll>
            <MembersPermissions />
          </MemberPanelScroll>
        ),
      },
      {
        value: 'links',
        label: t('links', 'Links'),
        icon: IconLink,
        content: <MemberLinks />,
      },
      {
        value: 'properties',
        label: panelT('properties', 'Properties'),
        icon: IconHierarchy2,
        content: (
          <MemberPanelScroll>
            <div className="p-3">
              <FieldsInDetail
                bare
                fieldContentType="core:user"
                propertiesData={userDetail.propertiesData || {}}
                mutateHook={useUserCustomFieldEdit}
                id={userDetail._id}
              />
            </div>
          </MemberPanelScroll>
        ),
      },
      ...(hasActionPermission('teamMembersResetPassword')
        ? [
            {
              value: 'sessions',
              label: t('sessions', 'Sessions'),
              icon: IconDeviceDesktop,
              content: (
                <MemberPanelScroll>
                  <div className="[&>section]:p-3">
                    <MemberSessions />
                  </div>
                </MemberPanelScroll>
              ),
            },
          ]
        : []),
      ...(currentUser?._id === userDetail._id ||
      hasActionPermission('teamMembersViewActivity')
        ? [
            {
              value: 'active-time',
              label: t('active-time', 'Active time'),
              icon: IconActivity,
              content: (
                <MemberPanelScroll>
                  <MemberActivityTime userId={userDetail._id} />
                </MemberPanelScroll>
              ),
            },
          ]
        : []),
      {
        value: 'activity',
        label: panelT('activity', 'Activity'),
        icon: IconHistory,
        content: (
          <MemberPanelScroll>
            <div className="pt-3 [&_.px-6]:px-2">
              <ActivityLogs
                targetId={userDetail._id}
                customActivities={memberCustomActivities}
                variant="backward"
              />
            </div>
          </MemberPanelScroll>
        ),
      },
    ];

    const activeTab = tabs.some((tab) => tab.value === selectedTab)
      ? selectedTab
      : DETAIL_TAB;

    return (
      <RecordSidePanel.Layout
        tabs={tabs}
        value={activeTab}
        onValueChange={setSelectedTab}
        visibleCount={tabs.length}
        overviewTab={DETAIL_TAB}
        overviewHeader={<ContactPanelIdentity title={title} avatar={avatar} />}
        expandedDefaultTab="activity"
      />
    );
  };

  return (
    <>
      <RecordSidePanel.Header
        className={expanded ? 'h-10 bg-background px-3' : undefined}
        avatar={expanded ? undefined : avatar}
        title={
          expanded ? <MemberPanelBreadcrumb title={breadcrumbTitle} /> : title
        }
        actions={userDetail && <MemberPanelActions user={userDetail} />}
        onBack={onBack}
        onClose={onClose}
      />
      {renderBody()}
    </>
  );
};
