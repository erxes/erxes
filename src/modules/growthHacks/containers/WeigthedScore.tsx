import gql from 'graphql-tag';
import { SaveMutation } from 'modules/boards/types';
import { Alert, withProps } from 'modules/common/utils';
import WeightedScore from 'modules/growthHacks/components/weightedScore/WeightedScore';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { mutations, queries } from '../graphql';
import { IGrowthHackParams } from '../types';
import { getFilterParams } from '../utils';

type Props = {
  queryParams: any;
  priorityMatrixRefetch?: () => void;
};

type FinalProps = {
  growthHacksQuery: any;
  growthHacksTotalCountQuery: any;
  editMutation: SaveMutation;
} & Props;

class WeigthedScoreContainer extends React.Component<FinalProps> {
  render() {
    const { growthHacksQuery, growthHacksTotalCountQuery } = this.props;

    const save = (id: string, doc: IGrowthHackParams) => {
      const { editMutation, priorityMatrixRefetch } = this.props;

      editMutation({ variables: { _id: id, ...doc } })
        .then(() => {
          Alert.success('You successfully updated an experiment');

          if (priorityMatrixRefetch) {
            priorityMatrixRefetch();
          }
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const { growthHacks = [], loading, refetch } = growthHacksQuery;

    const props = {
      ...this.props,
      growthHacks,
      loading,
      refetch,
      save,
      totalCount: growthHacksTotalCountQuery.growthHacksTotalCount
    };

    return <WeightedScore {...props} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, SaveMutation, IGrowthHackParams>(
      gql(mutations.growthHacksEdit),
      {
        name: 'editMutation'
      }
    ),
    graphql<Props>(gql(queries.growthHacks), {
      name: 'growthHacksQuery',
      options: ({ queryParams = {} }) => ({
        variables: {
          ...getFilterParams(queryParams),
          limit: parseInt(queryParams.limit, 10) || 15,
          sortField: queryParams.sortField,
          sortDirection: parseInt(queryParams.sortDirection, 10)
        }
      })
    }),
    graphql<Props>(gql(queries.growthHacksTotalCount), {
      name: 'growthHacksTotalCountQuery',
      options: ({ queryParams = {} }) => ({
        variables: getFilterParams(queryParams)
      })
    })
  )(WeigthedScoreContainer)
);
