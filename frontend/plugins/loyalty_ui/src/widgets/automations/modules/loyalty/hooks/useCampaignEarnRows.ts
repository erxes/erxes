import { useQuery } from '@apollo/client';
import { useEffect, useMemo } from 'react';
import { UseFormReturn, useWatch } from 'react-hook-form';
import { QUERY_SCORE_CAMPAIGN_DETAIL } from '~/modules/loyalties/settings/score/graphql/queries/getScoreCampaignDetailQuery';
import { parseEarnTable } from '~/modules/loyalties/settings/score/utils/earnTableForm';
import { TAdjustScoreActionConfigForm } from '../states/adjustScoreActionConfigFormDefinitions';

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
  const { data, loading } = useQuery(QUERY_SCORE_CAMPAIGN_DETAIL, {
    variables: { _id: campaignId || '' },
    skip: !campaignId,
  });
  const rows = useMemo(
    () =>
      (parseEarnTable(data?.scoreCampaign?.add)?.rows ?? []).flatMap(
        ({ key, name, kind }) => (key ? [{ key, name, kind }] : []),
      ),
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
