import { useEffect } from 'react';
import { PageSubHeader } from 'erxes-ui';
import { useLoyaltyHeaderAction } from '~/modules/loyalties/components/LoyaltyHeaderActionContext';
import { ScoreFilter } from '../../modules/loyalties/score/components/ScoreFilter';
import { ScoreRecordTable } from '../../modules/loyalties/score/components/ScoreRecordTable';
import { GiveScoreModal } from '../../modules/loyalties/score/components/GiveScoreModal';
import { ScoreSummaryWidget } from '../../modules/loyalties/score/components/ScoreSummaryWidget';

export const ScorePage = () => {
  const { setAction } = useLoyaltyHeaderAction();

  useEffect(() => {
    setAction(<GiveScoreModal />);
    return () => setAction(null);
  }, [setAction]);

  return (
    <div className="flex overflow-hidden w-full h-full">
      <div className="flex flex-col overflow-hidden w-full h-full">
        <PageSubHeader>
          <ScoreFilter />
        </PageSubHeader>
        <ScoreRecordTable />
      </div>
      <ScoreSummaryWidget />
    </div>
  );
};
