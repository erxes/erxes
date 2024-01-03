import React from 'react';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { graphql } from '@apollo/client/react/hoc';
import { mutations } from '../graphql';
import { Alert, __, confirm } from '@erxes/ui/src/utils';
import { NeighborItemRemoveMutationResponse } from '../types';
import Item from '../components/Item';

type Props = {
  item: any;
  refetch: () => void;
};

type FinalProps = {} & Props & NeighborItemRemoveMutationResponse;

class ListContainer extends React.Component<FinalProps> {
  render() {
    const { neighborItemRemove, item, refetch } = this.props;

    const remove = _id => {
      confirm().then(() =>
        neighborItemRemove({ variables: { _id } })
          .then(e => {
            Alert.success('Remove Successfully');
            this.props.refetch();
          })
          .catch(error => {
            Alert.error(error.message);
          })
      );
    };

    return <Item remove={remove} item={item} refetch={refetch} />;
  }
}

export default compose(
  graphql(gql(mutations.neighborItemRemove), {
    name: 'neighborItemRemove'
  })
)(ListContainer);
