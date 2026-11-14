import { PageContainer } from 'erxes-ui';
import { useQueryState } from 'nuqs';
import { useParams } from 'react-router-dom';
import { MemberDetail } from './MemberDetail';
import { RecordSidePanel } from '~/modules/side-panel/RecordSidePanel';
import { ResetPasswordDialog } from './ResetPasswordDialog';

/** The member's own page: the record panel, expanded. */
export const TeamMemberDetailPage = () => {
  const { id = '' } = useParams<{ id: string }>();
  const [tab, setTab] = useQueryState('tab');

  return (
    <PageContainer className="min-w-0 flex-1">
      <RecordSidePanel expanded expandedMode="page" expandable={false}>
        <MemberDetail key={id} memberId={id} tab={tab} onTabChange={(next) => void setTab(next)} />
      </RecordSidePanel>
      <ResetPasswordDialog />
    </PageContainer>
  );
};
