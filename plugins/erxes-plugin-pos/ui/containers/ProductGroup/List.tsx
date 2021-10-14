import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import PosList from '../../components/Pos/PosList';
import { mutations, queries } from '../../graphql';
import {  GroupsQueryResponse } from '../../types';
// import { Alert, confirm } from 'erxes-ui';

type Props = {
  history: any;
  queryParams: any;
};

type FinalProps = {
  groupsQuery: GroupsQueryResponse;
} & Props;

class ListContainer extends React.Component<FinalProps> {
  render() {
    const { groupsQuery } = this.props;

    // const remove = posId => {
    //   confirm().then(() => {
    //     posRemove({
    //       variables: { _id: posId }
    //     })
    //       .then(() => {
    //         posListQuery.refetch();

    //         Alert.success(`You successfully deleted a POS`);
    //       })
    //       .catch(error => {
    //         Alert.error(error.message);
    //       });
    //   });
    // };

    const extendedProps = {
      ...this.props,
      groups: groupsQuery.productGroups || []
    };

    return <PosList {...extendedProps} />;
  }
}

// const options = () => ({
//   refetchQueries: ['posListQuery']
// });

export default compose(
  graphql<Props, GroupsQueryResponse>(gql(queries.productGroups), {
    name: 'groupsQuery'
  }),
)(ListContainer);
