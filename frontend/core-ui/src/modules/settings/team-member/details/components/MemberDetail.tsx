import { FocusSheet, Separator, useQueryState } from 'erxes-ui';
import { MemberDetailGeneral } from './MemberDetailGeneral';
import { useUserDetail } from '../../hooks/useUserDetail';
import { MemberDetailSidebar } from './MemberDetailSidebar';
import { MemberDetailMainContents } from './MemberDetailMainContents';
import { MemberDetailErrorState } from './MemberDetailErrorState';
import { RelationWidgetSideTabs } from 'ui-modules';
import { MemberDetailEmptyState } from './MemberDetailEmptyState';

export const MemberDetail = () => {
  const [open, setOpen] = useQueryState<string>('user_id');
  const { error, userDetail, loading } = useUserDetail();

  return (
    <FocusSheet open={!!open} onOpenChange={() => setOpen(null)}>
      <FocusSheet.View
        loading={loading}
        error={!!error}
        notFound={!userDetail}
        notFoundState={<MemberDetailEmptyState />}
        errorState={<MemberDetailErrorState />}
      >
        <FocusSheet.Header title="Member Detail" />
        <FocusSheet.Content>
          <FocusSheet.SideBar>
            <MemberDetailSidebar />
          </FocusSheet.SideBar>
          <div className="flex-1 flex flex-col overflow-hidden">
            <MemberDetailGeneral />
            <Separator />
            <MemberDetailMainContents />
          </div>
          <RelationWidgetSideTabs
            contentId={userDetail?._id || ''}
            contentType="core:user"
          />
        </FocusSheet.Content>
      </FocusSheet.View>
    </FocusSheet>
  );
};
