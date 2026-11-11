import { PageContainer, useQueryState } from 'erxes-ui';
import { useParams } from 'react-router-dom';
import { MemberDetail } from './MemberDetail';
import { RecordSidePanel } from './RecordSidePanel';
import { ResetPasswordDialog } from './ResetPasswordDialog';

/** The member's own page (old `TeamMemberDetailPage`): the record panel, expanded. */
export const TeamMemberDetailPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const [tab, setTab] = useQueryState<string>('tab');

  return (
    <PageContainer className="min-w-0 flex-1">
      <RecordSidePanel expanded>
        <MemberDetail key={id} memberId={id} tab={tab} onTabChange={setTab} />
      </RecordSidePanel>
      <ResetPasswordDialog />
    </PageContainer>
  );
};
