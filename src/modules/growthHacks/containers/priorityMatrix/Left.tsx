import gql from 'graphql-tag';
import { SaveMutation } from 'modules/boards/types';
import { Alert, withProps } from 'modules/common/utils';
import Left from 'modules/growthHacks/components/priorityMatrix/Left';
import { IGrowthHackParams } from 'modules/growthHacks/types';
import { getFilterParams } from 'modules/growthHacks/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { mutations, queries } from '../../graphql';

type Props = {
  queryParams: any;
  priorityMatrixRefetch: () => void;
};

type FinalProps = {
  growthHacksQuery: any;
  growthHacksTotalCountQuery: any;
  editMutation: SaveMutation;
  addMutation: SaveMutation;
} & Props;

class LeftContainer extends React.Component<FinalProps> {
  render() {
    const { growthHacksTotalCountQuery, growthHacksQuery } = this.props;

    const edit = (id: string, doc: IGrowthHackParams) => {
      const { editMutation, priorityMatrixRefetch } = this.props;

      editMutation({ variables: { _id: id, ...doc } })
        .then(() => {
          Alert.success('You successfully updated an experiment');

          priorityMatrixRefetch();
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const add = (doc: IGrowthHackParams) => {
      const { addMutation } = this.props;

      addMutation({ variables: { ...doc } })
        .then(() => {
          Alert.success('You successfully added an experiment');

          growthHacksQuery.refetch();
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const growthHacks = growthHacksQuery.growthHacks || [];

    const extendedProps = {
      ...this.props,
      growthHacks,
      loading: growthHacksQuery.loading,
      edit,
      add,
      totalCount: growthHacksTotalCountQuery.growthHacksTotalCount
    };

    return <Left {...extendedProps} />;
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
    graphql<Props, SaveMutation, IGrowthHackParams>(
      gql(mutations.growthHacksAdd),
      {
        name: 'addMutation'
      }
    ),
    graphql<Props>(gql(queries.growthHacks), {
      name: 'growthHacksQuery',
      options: ({ queryParams = {} }) => ({
        variables: {
          ...getFilterParams(queryParams),
          limit: parseInt(queryParams.limit, 10),
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
  )(LeftContainer)
);
