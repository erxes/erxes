import { memberCustomActivities } from '@/settings/team-member/details/components/MemberActivityRows';
import { MemberDetailEmptyState } from '@/settings/team-member/details/components/MemberDetailEmptyState';
import { MemberDetailErrorState } from '@/settings/team-member/details/components/MemberDetailErrorState';
import { MemberLinks } from '@/settings/team-member/details/components/MemberLinks';
import { MemberPanelActions } from '@/settings/team-member/details/components/MemberPanelActions';
import { MemberPanelDetail } from '@/settings/team-member/details/components/MemberPanelDetail';
import { MembersPermissions } from '@/settings/team-member/details/components/MembersPermissions';
import { useUserDetail } from '@/settings/team-member/hooks/useUserDetail';
import { useUserCustomFieldEdit } from '@/settings/team-member/hooks/useUserEdit';
import { MemberSessions } from '@/settings/team-member/sessions/components/MemberSessions';
import {
  IconDeviceDesktop,
  IconHierarchy2,
  IconHistory,
  IconId,
  IconLink,
  IconShieldLock,
} from '@tabler/icons-react';
import {
  Avatar,
  readImage,
  ScrollArea,
  Skeleton,
  Spinner,
  useQueryState,
} from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import {
  ActivityLogs,
  FieldsInDetail,
  IRecordSidePanelTab,
  RecordSidePanel,
  usePermissionCheck,
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
  onClose: () => void;
}) => {
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });
  const { t: panelT } = useTranslation('common', { keyPrefix: 'side-panel' });
  const [selectedTab, setSelectedTab] = useQueryState<string>('tab');
  const { error, userDetail, loading } = useUserDetail();
  const { hasActionPermission } = usePermissionCheck();

  const handleClose = () => {
    setSelectedTab(null);
    onClose();
  };

  const renderHeading = () => {
    if (!userDetail) {
      return {
        title: loading ? (
          <Skeleton className="h-4 w-32" />
        ) : (
          t('member-detail')
        ),
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
      title,
      avatar: (
        <Avatar size="lg" className="size-7 flex-none">
          <Avatar.Image src={readImage(avatar || '')} />
          <Avatar.Fallback>{title.charAt(0)}</Avatar.Fallback>
        </Avatar>
      ),
    };
  };

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
      ? (selectedTab as string)
      : DETAIL_TAB;

    return (
      <RecordSidePanel.Tabs
        tabs={tabs}
        value={activeTab}
        onValueChange={setSelectedTab}
        visibleCount={tabs.length}
      />
    );
  };

  const { title, avatar } = renderHeading();

  return (
    <>
      <RecordSidePanel.Header
        avatar={avatar}
        title={title}
        actions={userDetail && <MemberPanelActions user={userDetail} />}
        onBack={onBack}
        onClose={handleClose}
      />
      {renderBody()}
    </>
  );
};
