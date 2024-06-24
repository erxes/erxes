import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { SaveMutation } from '@erxes/ui-cards/src/boards/types';
import { Alert, withProps } from '@erxes/ui/src/utils';
import WeightedScore from '../components/weightedScore/WeightedScore';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import { mutations, queries } from '../graphql';
import {
  GrowthHacksCountQueryResponse,
  GrowthHacksQueryResponse,
  IGrowthHackParams
} from '../types';
import { getFilterParams } from '../utils';

type Props = {
  component: any;
  queryParams: any;
  refetch?: () => void;
};

type FinalProps = {
  growthHacksQuery: GrowthHacksQueryResponse;
  growthHacksTotalCountQuery: GrowthHacksCountQueryResponse;
  editMutation: SaveMutation;
} & Props;

class EditableGrowthHackList extends React.Component<FinalProps> {
  render() {
    const { growthHacksQuery, growthHacksTotalCountQuery } = this.props;

    const save = (id: string, doc: IGrowthHackParams) => {
      const { editMutation } = this.props;

      editMutation({ variables: { _id: id, ...doc } })
        .then(() => {
          Alert.success('You successfully updated an experiment');

          if (this.props.refetch) {
            this.props.refetch();
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

    const Component = this.props.component || WeightedScore;

    return <Component {...props} />;
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
  )(EditableGrowthHackList)
);
