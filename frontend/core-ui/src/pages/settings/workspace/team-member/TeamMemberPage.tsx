import { TeamMember } from '@/settings/team-member/components/TeamMember';
import { PageContainer, useQueryState } from 'erxes-ui';
import { ResetPasswordDialog } from '@/settings/team-member/details/components/ResetPasswordDialog';
import { MemberDetail } from '@/settings/team-member/details/components/MemberDetail';

export function TeamMemberPage() {
  const [userId] = useQueryState('user_id');
  const [resetId] = useQueryState('reset_password_id');

  return (
    <PageContainer>
      <TeamMember />
      {!!userId && <MemberDetail />}
      {!!resetId && <ResetPasswordDialog />}
    </PageContainer>
  );
}
