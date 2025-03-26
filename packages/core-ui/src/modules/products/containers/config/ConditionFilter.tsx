import { BundleConditionCountQueryResponse } from '../../types';
import CountsByBundleRule from '@erxes/ui/src/components/CountsByBundleRule';
import React from 'react';
import { gql } from '@apollo/client';
import { queries } from '../../graphql';
import { useQuery } from '@apollo/client';
import { BundleRulesQueryResponse } from '@erxes/ui-products/src/types';

const ConditionFilter = () => {
  const countQuery = useQuery<BundleConditionCountQueryResponse>(
    gql(queries.bundleConditionTotalCount)
  );
  const bundleRuleQuery = useQuery<BundleRulesQueryResponse>(
    gql(queries.bundleRules)
  );

  const counts =
    (countQuery.data && countQuery.data.bundleConditionTotalCount) || {};
  const bundleRules =
    (bundleRuleQuery.data && bundleRuleQuery.data.bundleRules) || [];

  return (
    <CountsByBundleRule
      bundleRules={bundleRules}
      counts={counts}
      manageUrl='/settings/bundle-rule'
      loading={(bundleRuleQuery ? bundleRuleQuery.loading : null) || false}
    />
  );
};

export default ConditionFilter;
