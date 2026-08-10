import { useLocation } from 'react-router';
import { ScorePath } from '~/modules/loyalties/scores/types/path/Score';
import { SCORE_CURSOR_SESSION_KEY } from '../constants/scoreCursorSessionKey';

export const useScoreLeadSessionKey = () => {
  const { pathname } = useLocation();

  const isScore = pathname.includes(ScorePath.Index);

  return {
    isScore,
    sessionKey: SCORE_CURSOR_SESSION_KEY,
  };
};
