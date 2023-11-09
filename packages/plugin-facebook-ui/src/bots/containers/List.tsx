import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { withProps } from '@erxes/ui/src/utils';
import * as compose from 'lodash.flowright';
import React from 'react';
import ListComponent from '../components/List';
import { queries } from '../graphql';
import Spinner from '@erxes/ui/src/components/Spinner';

type Props = {
  queryParams: any;
};

type FinalProps = { listQueryResponse; totalCountQueryResponse } & Props;

class List extends React.Component<FinalProps> {
  render() {
    const { listQueryResponse, totalCountQueryResponse } = this.props;

    if (listQueryResponse?.loading) {
      return <Spinner />;
    }

    const updatedProps = {
      list: listQueryResponse?.facebootMessengerBots || [],
      totalCount: totalCountQueryResponse?.facebootMessengerBotsTotalCount || []
    };

    return <ListComponent {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.list), {
      name: 'listQueryResponse'
    }),
    graphql<Props>(gql(queries.totalCount), {
      name: 'totalCountQueryResponse'
    })
  )(List)
);
