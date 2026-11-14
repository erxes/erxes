import { useNavigate } from 'react-router-dom';
import { paths } from '~/lib/paths';
import { MemberDetail } from './MemberDetail';
import { RecordSidePanel } from '~/modules/side-panel/RecordSidePanel';
import { useMemberPanel } from './useMemberPanel';

/** The member open beside the list (`?user_id=`); expanding opens their page. */
export const TeamMemberSidePanel = () => {
  const { memberId, tab, setTab, close } = useMemberPanel();
  const navigate = useNavigate();

  if (!memberId) return null;

  return (
    <RecordSidePanel key={memberId} expandable={false}>
      <MemberDetail
        memberId={memberId}
        tab={tab}
        onTabChange={setTab}
        onExpand={() => {
          void navigate({
            pathname: paths.settings.teamMember(memberId),
            search: tab ? `?tab=${tab}` : '',
          });
        }}
        onClose={close}
      />
    </RecordSidePanel>
  );
};
