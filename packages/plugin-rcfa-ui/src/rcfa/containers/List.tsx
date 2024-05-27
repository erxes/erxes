import { withProps } from '@erxes/ui/src/utils/core';
import * as compose from 'lodash.flowright';
import React from 'react';
import List from '../components/List';
import { gql } from '@apollo/client';
import { queries } from '../graphql';
import { graphql } from '@apollo/client/react/hoc';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
  rcfaList: any;
  page: number;
  pageSize: number;
};

type FinalProps = {} & Props;

class ListContainer extends React.Component<FinalProps> {
  static displayName = 'rcfa';

  constructor(props: FinalProps) {
    super(props);
  }

  render() {
    const { queryParams, history, rcfaList } = this.props;

    let rcfa: any = [];
    let totalCount: number = 0;

    if (!rcfaList.loading) {
      rcfa = rcfaList.rcfaList.list;
      const count = rcfaList.rcfaList.totalCount;
      totalCount = count;
    }

    const updatedProps = {
      queryParams,
      history,
      list: rcfa,
      totalCount
    };

    return <List {...updatedProps} />;
  }
}

const rcfaRefetchQueries = queryParams => {
  return [
    {
      query: gql(queries.rcfaList),
      variables: queryParams
    }
  ];
};

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.rcfaList), {
      name: 'rcfaList',
      options: (props: any) => ({
        variables: {
          mainType: props.mainType,
          searchValue: props.searchValue,
          page: parseInt(props.queryParams?.page, 10),
          perPage: parseInt(props.queryParams?.perPage, 10),
          createdAtFrom: props.queryParams?.createdAtFrom,
          createdAtTo: props.queryParams?.createdAtTo,
          closedAtFrom: props.queryParams?.closedAtFrom,
          closedAtTo: props.queryParams?.closedAtTo,
          status: props.queryParams?.status
        },
        refetchQueries: rcfaRefetchQueries(props)
      })
    })
  )(ListContainer)
);
