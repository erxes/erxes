import { useQuery } from '@apollo/client';
import { useEffect, useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { QUERY_SCORE_CAMPAIGN_DETAIL } from '~/modules/loyalties/settings/score/graphql/queries/getScoreCampaignDetailQuery';
import { IEarnTableInput } from '~/modules/loyalties/settings/score/types/earnTable';
import { TAdjustScoreActionConfigForm } from '../states/adjustScoreActionConfigFormDefinitions';

type TEarnRow = Required<Pick<IEarnTableInput['rows'][number], 'key'>> &
  Pick<IEarnTableInput['rows'][number], 'name' | 'kind'>;

// The rows of the chosen campaign's earning table. An automation without a
// choice yet starts with every row the campaign has now, so rows added to the
// campaign later stay off here until someone turns them on.
export const useCampaignEarnRows = (
  form: UseFormReturn<TAdjustScoreActionConfigForm>,
) => {
  const [campaignId, earnRowKeys] = useWatch({
    control: form.control,
    name: ['campaignId', 'earnRowKeys'],
  });
  const { data, loading } = useQuery<{
    scoreCampaign?: { add?: { table?: { rows?: TEarnRow[] } } };
  }>(QUERY_SCORE_CAMPAIGN_DETAIL, {
    variables: { _id: campaignId },
    skip: !campaignId,
  });
  const rows = useMemo(
    () => data?.scoreCampaign?.add?.table?.rows || [],
    [data],
  );

  useEffect(() => {
    if (!earnRowKeys && rows.length) {
      form.setValue(
        'earnRowKeys',
        rows.map(({ key }) => key),
        { shouldDirty: true },
      );
    }
  }, [earnRowKeys, rows, form]);

  return { rows, loading };
};
