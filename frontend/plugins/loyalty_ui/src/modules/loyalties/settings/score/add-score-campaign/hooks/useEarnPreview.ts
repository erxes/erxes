import { useQuery } from '@apollo/client';
import { useEffect, useMemo, useState } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { LoyaltyScoreFormValues } from '../../constants/formSchema';
import { SCORE_CAMPAIGN_EARN_PREVIEW } from '../../graphql/queries/scoreCampaignEarnPreviewQuery';
import { toAddInput } from '../../utils/earnTableForm';
import { parseEarnBreakdown } from '@/loyalties/scores/utils/parseEarnBreakdown';
import { compactList } from '@/loyalties/utils/cursorList';
import type { ScoreCampaignEarnPreviewQueryVariables } from '~/gql/graphql';

const DEBOUNCE_MS = 300;

// The server evaluates the table being edited, so the sample always matches
// what the ledger will earn.
export const useEarnPreview = (form: UseFormReturn<LoyaltyScoreFormValues>) => {
  const [amount, setAmount] = useState('100000');
  const [add, accountTypeId] = useWatch({
    control: form.control,
    name: ['add', 'accountTypeId'],
  });
  const table = toAddInput(add)?.table;
  const [variables, setVariables] =
    useState<ScoreCampaignEarnPreviewQueryVariables>();

  // One string carries every input, so the debounce restarts only when an
  // input really changes and not on every render.
  const payload = JSON.stringify({
    accountTypeId: accountTypeId || undefined,
    table,
    amount: Number(amount) || 0,
  });

  useEffect(() => {
    const timer = setTimeout(
      () => setVariables(JSON.parse(payload)),
      DEBOUNCE_MS,
    );

    return () => clearTimeout(timer);
  }, [payload]);

  const { data, loading, previousData } = useQuery(
    SCORE_CAMPAIGN_EARN_PREVIEW,
    { variables, skip: !variables?.table, fetchPolicy: 'no-cache' },
  );

  const preview = (data || previousData)?.scoreCampaignEarnPreview;
  const results = useMemo(
    () =>
      compactList(preview).map((result) => ({
        ...result,
        breakdown: parseEarnBreakdown(result.breakdown),
      })),
    [preview],
  );

  return {
    amount,
    setAmount,
    loading,
    results,
  };
};
