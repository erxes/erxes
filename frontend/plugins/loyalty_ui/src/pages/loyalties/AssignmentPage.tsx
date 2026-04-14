import { useEffect } from 'react';
import { PageSubHeader } from 'erxes-ui';
import { useLoyaltyHeaderAction } from '~/modules/loyalties/components/LoyaltyHeaderActionContext';
import { AssignmentRecordTable } from '~/modules/loyalties/assignments/components/AssignmentRecordTable';
import { AssignmentFilter } from '~/modules/loyalties/assignments/components/AssignmentFilter';
import { AssignmentAddModal } from '~/modules/loyalties/assignments/components/AssignmentAddModal';

const AssignmentHeaderActions = () => (
  <div className="flex items-center gap-2">
    <AssignmentAddModal />
  </div>
);

export const AssignmentPage = () => {
  const { setAction } = useLoyaltyHeaderAction();

  useEffect(() => {
    setAction(<AssignmentHeaderActions />);
    return () => setAction(null);
  }, [setAction]);

  return (
    <div className="flex flex-col flex-auto overflow-hidden">
      <PageSubHeader>
        <AssignmentFilter />
      </PageSubHeader>
      <AssignmentRecordTable />
    </div>
  );
};
