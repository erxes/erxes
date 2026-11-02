import { TeamMember } from '@/settings/team-member/components/TeamMember';
import { PageContainer, useQueryState } from 'erxes-ui';
import { ResetPasswordDialog } from '@/settings/team-member/details/components/ResetPasswordDialog';

export function TeamMemberPage() {
  const [resetId] = useQueryState('reset_password_id');
  return (
    <PageContainer>
      <TeamMember />
      {!!resetId && <ResetPasswordDialog />}
    </PageContainer>
  );
}
