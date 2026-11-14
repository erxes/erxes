import { useNavigate, useSearchParams } from 'react-router-dom';
import { teamMemberPath } from '../constants';
import { MemberDetail } from './MemberDetail';
import { RecordSidePanel } from './RecordSidePanel';
import { useMemberPanel } from './useMemberPanel';

/** The member open beside the list (`?user_id=`); expanding opens their page. */
export const TeamMemberSidePanel = () => {
  const { memberId, close } = useMemberPanel();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  if (!memberId) return null;

  const tab = searchParams.get('tab');

  return (
    <RecordSidePanel key={memberId}>
      <MemberDetail
        memberId={memberId}
        tab={tab}
        onTabChange={(next) =>
          setSearchParams((previous) => {
            const params = new URLSearchParams(previous);

            params.set('tab', next);

            return params;
          })
        }
        onExpand={() => {
          void navigate(`${teamMemberPath(memberId)}${tab ? `?tab=${tab}` : ''}`);
        }}
        onClose={close}
      />
    </RecordSidePanel>
  );
};
