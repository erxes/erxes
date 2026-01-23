import { Separator, Sheet, Spinner, useToast } from 'erxes-ui';
import {
  MemberDetailLayout,
  MemberDetailTabContent,
} from '@/settings/team-member/details/components/MemberDetailLayout';
import { MemberDetailGeneral } from '@/settings/team-member/details/components/MemberDetailGeneral';
import { MemberLinks } from '@/settings/team-member/details/components/MemberLinks';
import { useUserDetail } from '@/settings/team-member/hooks/useUserDetail';
import { ApolloError } from '@apollo/client';
import { MemberGeneral } from '@/settings/team-member/details/components/MemberGeneral';
import { UserDetailActions } from '@/settings/team-member/details/components/UserDetailActions';
import { ActivityLogs, FieldsInDetail } from 'ui-modules';
import { useUserCustomFieldEdit } from '../../hooks/useUserEdit';

export function MemberDetail() {
  const { toast } = useToast();
  const { error, userDetail, loading } = useUserDetail({
    onError: (e: ApolloError) => {
      if (!e.message.includes('not found')) {
        toast({
          title: 'Error',
          description: e.message,
          variant: 'destructive',
        });
      }
    },
  });

  return (
    <MemberDetailLayout
      actions={<UserDetailActions />}
      otherState={
        error?.message.includes('not found') ? 'not-found' : undefined
      }
    >
      {loading ? (
        <Spinner />
      ) : (
        <div className="flex flex-auto flex-col">
          <MemberDetailGeneral />
          <Separator />
          <Sheet.Content className="border-b-0 rounded-b-none">
            <MemberDetailTabContent value="overview">
              <MemberGeneral />
            </MemberDetailTabContent>
            <MemberDetailTabContent value="links" className="h-full">
              <MemberLinks />
            </MemberDetailTabContent>
            <MemberDetailTabContent value="activity" className="h-full">
              {userDetail ? <ActivityLogs targetId={userDetail._id} /> : <></>}
            </MemberDetailTabContent>
            <MemberDetailTabContent value="properties" className="h-full p-6">
              <FieldsInDetail
                fieldContentType="core:user"
                customFieldsData={userDetail?.customFieldsData || {}}
                mutateHook={useUserCustomFieldEdit}
                id={userDetail?._id || ''}
              />
            </MemberDetailTabContent>
          </Sheet.Content>
        </div>
      )}
    </MemberDetailLayout>
  );
}
