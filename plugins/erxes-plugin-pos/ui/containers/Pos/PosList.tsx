import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import PosList from '../../components/Pos/PosList';
import { mutations, queries } from '../../graphql';
import { IPos, PosListQueryResponse, PosRemoveMutationResponse } from '../../types';
import { Alert, confirm } from 'erxes-ui';

type Props = {
  history: any;
  queryParams: any;
  onChangePos: (pos: IPos) => void;
};

type FinalProps = {
  posListQuery: PosListQueryResponse;
} & Props &
  PosRemoveMutationResponse;
class PosListContainer extends React.Component<FinalProps> {
  render() {
    const { posListQuery, posRemove } = this.props;

    const remove = posId => {
      confirm().then(() => {
        posRemove({
          variables: { _id: posId }
        })
          .then(() => {
            posListQuery.refetch();

            Alert.success(`You successfully deleted a POS`);
          })
          .catch(error => {
            Alert.error(error.message);
          });
      });
    };

    const extendedProps = {
      ...this.props,
      remove,
      posList: posListQuery.allPos || []
    };

    return <PosList {...extendedProps} />;
  }
}

const options = () => ({
  refetchQueries: ['posListQuery']
});

export default compose(
  graphql<Props, PosListQueryResponse>(gql(queries.posList), {
    name: 'posListQuery'
  }),
  graphql<Props, PosRemoveMutationResponse, { _id: string }>(
    gql(mutations.posRemove),
    {
      name: 'posRemove',
      options
    }
  )
)(PosListContainer);
