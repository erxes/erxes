import { Alert } from '@erxes/ui/src/utils';

import React from 'react';
import ConditionSelecter from '../../components/config/condition/ConditionSelecter';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client';
import { mutations, queries } from '../../graphql';
import {
  BundleRulesQueryResponse,
  IBundleRule
} from '@erxes/ui-products/src/types';

type Props = {
  // targets can be conversation, customer, company etc ...
  targets?: any[];
  event?: 'onClick' | 'onExit';
  successCallback?: () => void;
  className?: string;
  refetchQueries?: any[];
  perPage?: number;
  singleSelect?: boolean;
  disableTreeView?: boolean;
};

const TaggerContainer = (props: Props) => {
  const bundleRulesQuery = useQuery<BundleRulesQueryResponse>(
    gql(queries.bundleRules),
    {
      variables: {
        perPage: props.perPage || 20
      }
    }
  );

  const tagsCountQuery = useQuery(gql(queries.bundleConditionTotalCount), {
    variables: {}
  });

  const [setBulkMutation] = useMutation(gql(mutations.bundleConditionSetBulk), {
    refetchQueries: props.refetchQueries
  });

  const { targets = [], successCallback } = props;

  const bundleRules =
    (bundleRulesQuery.data && bundleRulesQuery.data.bundleRules) || [];
  const totalCount =
    (tagsCountQuery.data && tagsCountQuery.data.tagsQueryCount) || 0;

  const setBundle = selectedBundleId => {
    const variables = {
      productIds: targets.map(t => t._id),
      bundleId: selectedBundleId
    };

    setBulkMutation({ variables })
      .then(() => {
        let message = `The bundle has been set!`;

        if (targets.length > 0) {
          message = `Selected product have been set!`;
        }

        Alert.success(message);

        if (successCallback) {
          successCallback();
        }
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const onLoadMore = (page: number) => {
    return (
      bundleRulesQuery &&
      bundleRulesQuery.fetchMore({
        variables: {
          perPage: props.perPage || 20,
          page
        },
        updateQuery: (prevResult, { fetchMoreResult }) => {
          if (!fetchMoreResult || fetchMoreResult.bundleRules.length === 0) {
            return prevResult;
          }

          const prevTags = prevResult.bundleRules || [];
          const prevTagsIds = prevTags.map((t: IBundleRule) => t._id);

          const fetchedTags: IBundleRule[] = [];

          for (const t of fetchMoreResult.bundleRules) {
            if (!prevTagsIds.includes(t._id)) {
              fetchedTags.push(t);
            }
          }

          return {
            ...prevResult,
            tags: [...prevTags, ...fetchedTags]
          };
        }
      })
    );
  };

  const updatedProps = {
    ...props,
    loading: bundleRulesQuery.loading,
    bundleRules,
    totalCount,
    onLoadMore,
    setBundle
  };

  return <ConditionSelecter {...updatedProps} />;
};

export default TaggerContainer;
