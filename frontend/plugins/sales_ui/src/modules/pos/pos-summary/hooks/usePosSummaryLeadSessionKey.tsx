import { useLocation } from 'react-router';
import { PosSummaryPath } from '../types/path/PosSummary';
import { POS_SUMMARY_CURSOR_SESSION_KEY } from '../constants/posSummaryCursorSessionKey';

export const usePosSummaryLeadSessionKey = () => {
  const { pathname } = useLocation();

  const isPosSummary = pathname.includes(PosSummaryPath.Index);

  return {
    isPosSummary,
    sessionKey: POS_SUMMARY_CURSOR_SESSION_KEY,
  };
};
