import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Bulk from '@erxes/ui/src/components/Bulk';
import { withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import SideBarDetail from '../components/perform/overallWorkSideBar/OveralWorksSideBarDetail';
import { queries } from '../graphql';
import { OverallWorksSideBarDetailQueryResponse } from '../types';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  overallWorksSideBarDetailQuery: OverallWorksSideBarDetailQueryResponse;
} & Props;

class OverallWorkSideBarContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { overallWorksSideBarDetailQuery, queryParams } = this.props;

    if (overallWorksSideBarDetailQuery.loading) {
      return false;
    }

    const overallWork =
      overallWorksSideBarDetailQuery.overallWorksSideBarDetail || [];

    const updatedProps = {
      ...this.props,
      queryParams,
      overallWork,
      loading: overallWorksSideBarDetailQuery.loading
    };

    const overallWorkSideBar = props => {
      return <SideBarDetail {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.overallWorksSideBarDetailQuery.refetch();
    };

    return <Bulk content={overallWorkSideBar} refetch={refetch} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, OverallWorksSideBarDetailQueryResponse, {}>(
      gql(queries.overallWorksSideBarDetail),
      {
        name: 'overallWorksSideBarDetailQuery',
        options: ({ queryParams }) => ({
          variables: {
            id: queryParams.overallWorkId
          },
          fetchPolicy: 'network-only'
        })
      }
    )
  )(OverallWorkSideBarContainer)
);
