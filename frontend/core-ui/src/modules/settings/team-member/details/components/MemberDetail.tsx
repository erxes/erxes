import { CoreFocusPanel } from '@/side-panel/components/CoreModulePanel';
import { Separator, useQueryState } from 'erxes-ui';
import { MemberDetailGeneral } from './MemberDetailGeneral';
import { useUserDetail } from '../../hooks/useUserDetail';
import { MemberDetailSidebar } from './MemberDetailSidebar';
import { MemberDetailMainContents } from './MemberDetailMainContents';
import { MemberDetailErrorState } from './MemberDetailErrorState';
import { PrintDocument } from 'ui-modules';
import { MemberDetailEmptyState } from './MemberDetailEmptyState';
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
