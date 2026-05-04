import { useEffect } from 'react';
import { Button, PageSubHeader } from 'erxes-ui';
import { Link } from 'react-router';
import { IconSettings } from '@tabler/icons-react';
import { useLoyaltyHeaderAction } from '~/modules/loyalties/components/LoyaltyHeaderActionContext';
import { AssignmentRecordTable } from '~/modules/loyalties/assignments/components/AssignmentRecordTable';
import { AssignmentFilter } from '~/modules/loyalties/assignments/components/AssignmentFilter';
import { AssignmentAddModal } from '~/modules/loyalties/assignments/components/AssignmentAddModal';

const AssignmentHeaderActions = () => (
  <div className="flex items-center gap-2">
    <Button variant="outline" size="sm" asChild>
      <Link to="/settings/loyalty/config/assignment">
        <IconSettings className="size-4" />
        Go to settings
      </Link>
    </Button>
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
