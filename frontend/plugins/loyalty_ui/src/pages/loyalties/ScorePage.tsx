import { useEffect } from 'react';
import { Button, PageSubHeader } from 'erxes-ui';
import { Link } from 'react-router';
import { IconSettings } from '@tabler/icons-react';
import { useLoyaltyHeaderAction } from '~/modules/loyalties/components/LoyaltyHeaderActionContext';
import { ScoreFilter } from '~/modules/loyalties/scores/components/ScoreFilter';
import { ScoreRecordTable } from '~/modules/loyalties/scores/components/ScoreRecordTable';
import { GiveScoreModal } from '~/modules/loyalties/scores/components/GiveScoreModal';
import { ScoreSummaryPanel } from '~/modules/loyalties/scores/components/ScoreSummaryWidget';

const ScoreHeaderActions = () => (
  <div className="flex items-center gap-2">
    <Button variant="outline" size="sm" asChild>
      <Link to="/settings/loyalty/config/score">
        <IconSettings className="size-4" />
        Go to settings
      </Link>
    </Button>
    <GiveScoreModal />
  </div>
);

export const ScorePage = () => {
  const { setAction } = useLoyaltyHeaderAction();

  useEffect(() => {
    setAction(<ScoreHeaderActions />);
    return () => setAction(null);
  }, [setAction]);

  return (
    <div className="flex flex-auto overflow-hidden">
      <div className="flex flex-col flex-auto overflow-hidden">
        <PageSubHeader>
          <ScoreFilter />
        </PageSubHeader>
        <ScoreRecordTable />
      </div>
      <ScoreSummaryPanel />
    </div>
  );
};
