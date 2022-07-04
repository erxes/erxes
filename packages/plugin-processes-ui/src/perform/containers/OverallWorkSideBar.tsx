import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Bulk from '@erxes/ui/src/components/Bulk';
import { withProps } from '@erxes/ui/src/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import SideBar from '../components/perform/overallWorkSideBar/OveralWorksSideBar';
import { queries } from '../graphql';
import { OverallWorksSideBarQueryResponse } from '../types';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  overallWorksSideBarQuery: OverallWorksSideBarQueryResponse;
} & Props;

class OverallWorkSideBarContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);
  }

  render() {
    const { overallWorksSideBarQuery, queryParams } = this.props;

    if (overallWorksSideBarQuery.loading) {
      return false;
    }

    const overallWorks = overallWorksSideBarQuery.overallWorksSideBar || [];

    console.log(
      'overallWorks overallWorks:',
      overallWorks,
      overallWorksSideBarQuery.overallWorksSideBar
    );
    const searchValue = this.props.queryParams.searchValue || '';
    const inBranchId = this.props.queryParams.inBranchId || '';
    const inDepartmentId = this.props.queryParams.inDepartmentId || '';
    const outBranchId = this.props.queryParams.outBranchId || '';
    const outDepartmentId = this.props.queryParams.outDepartmentId || '';
    const params = {
      inBranchId,
      inDepartmentId,
      outBranchId,
      outDepartmentId,
      searchValue
    };

    const updatedProps = {
      ...this.props,
      queryParams,
      overallWorks,
      loading: overallWorksSideBarQuery.loading,
      params
    };

    const overallWorkSideBar = props => {
      return <SideBar {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.overallWorksSideBarQuery.refetch();
    };

    return <Bulk content={overallWorkSideBar} refetch={refetch} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, OverallWorksSideBarQueryResponse, {}>(
      gql(queries.overallWorksSideBar),
      {
        name: 'overallWorksSideBarQuery',
        options: ({ queryParams }) => ({
          variables: {
            searchValue: queryParams.searchValue,
            inBranchId: queryParams.inBranchId,
            inDepartmentId: queryParams.inDepartmentId,
            outBranchId: queryParams.outBranchId,
            outDepartmentId: queryParams.outDepartmentId
          },
          fetchPolicy: 'network-only'
        })
      }
    )
  )(OverallWorkSideBarContainer)
);
