import { CoreFocusPanel } from '@/side-panel/components/CoreModulePanel';
import { Separator, useQueryState } from 'erxes-ui';
import { MemberDetailGeneral } from '@/settings/team-member/details/components/MemberDetailGeneral';
import { useUserDetail } from '@/settings/team-member/hooks/useUserDetail';
import { MemberDetailSidebar } from '@/settings/team-member/details/components/MemberDetailSidebar';
import { MemberDetailMainContents } from '@/settings/team-member/details/components/MemberDetailMainContents';
import { MemberDetailErrorState } from '@/settings/team-member/details/components/MemberDetailErrorState';
import { PrintDocument } from 'ui-modules';
import { MemberDetailEmptyState } from '@/settings/team-member/details/components/MemberDetailEmptyState';
import { useTranslation } from 'react-i18next';

export const MemberDetail = () => {
  const [open, setOpen] = useQueryState<string>('user_id');
  const { error, userDetail, loading } = useUserDetail();
  const { t } = useTranslation('settings', { keyPrefix: 'team-member' });

  return (
    <CoreFocusPanel
      name={'settings/team-member/MemberDetail'}
      open={!!open}
      onOpenChange={(next) => !next && setOpen(null)}
    >
      <CoreFocusPanel.View
        loading={loading}
        error={!!error}
        notFound={!userDetail}
        notFoundState={<MemberDetailEmptyState />}
        errorState={<MemberDetailErrorState />}
      >
        <CoreFocusPanel.Header title={t('member-detail')} />
        <CoreFocusPanel.Content>
          <CoreFocusPanel.SideBar>
            <MemberDetailSidebar />
          </CoreFocusPanel.SideBar>
          <div className="flex-1 flex flex-col overflow-hidden">
            <MemberDetailGeneral />
            {userDetail?._id && (
              <div className="flex flex-wrap items-center gap-2 px-8 pb-5">
                <PrintDocument
                  items={[{ _id: userDetail._id }]}
                  contentType="core:user"
                />
              </div>
            )}
            <Separator />
            <MemberDetailMainContents />
          </div>
        </CoreFocusPanel.Content>
      </CoreFocusPanel.View>
    </CoreFocusPanel>
  );
};
