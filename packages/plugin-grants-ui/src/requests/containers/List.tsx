import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import React from 'react';
import List from '../components/List';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import queries from '../graphql/queries';
import { Spinner } from '@erxes/ui/src';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};
type FinalProps = {
  listQuery: any;
} & Props;
class ListContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { listQuery } = this.props;

    if (listQuery.loading) {
      return <Spinner />;
    }

    const { grantRequests, grantRequestsTotalCount } = listQuery;

    const updatedProps = {
      list: grantRequests || [],
      totalCount: grantRequestsTotalCount
    };

    console.log({ dasds: 'sds' });

    return <List {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.requests), {
      name: 'listQuery',
      options: ({}) => ({})
    })
  )(ListContainer)
);
