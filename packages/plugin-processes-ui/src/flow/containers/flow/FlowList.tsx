import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import Bulk from '@erxes/ui/src/components/Bulk';
import { Alert, withProps } from '@erxes/ui/src/utils';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import List from '../../components/flow/FlowList';
import { mutations, queries } from '../../graphql';
import {
  flowsRemoveMutationResponse,
  flowTotalCountQueryResponse,
  FlowsQueryResponse,
  FlowsAddMutationResponse,
  IFlowDocument
} from '../../types';

type Props = {
  queryParams: any;
  history: any;
  type?: string;
};

type FinalProps = {
  flowsQuery: FlowsQueryResponse;
  flowTotalCountQuery: flowTotalCountQueryResponse;
} & Props &
  flowsRemoveMutationResponse &
  FlowsAddMutationResponse;

class ProductListContainer extends React.Component<FinalProps> {
  constructor(props) {
    super(props);

    this.state = {
      mergeProductLoading: false
    };
  }

  render() {
    const {
      queryParams,
      history,
      flowsQuery,
      flowTotalCountQuery,
      flowsRemove,
      flowsAdd
    } = this.props;

    const addFlow = (isSub?: boolean) => {
      flowsAdd({
        variables: {
          name: 'Your flow title',
          status: 'draft',
          isSub
        }
      })
        .then(data => {
          history.push({
            pathname: `/processes/flows/details/${data.data.flowsAdd._id}`,
            search: '?isCreate=true'
          });
        })

        .catch(error => {
          Alert.error(error.message);
        });
    };

    if (flowsQuery.loading) {
      return false;
    }

    // remove action
    const remove = ({ flowIds }, emptyBulk) => {
      flowsRemove({
        variables: { flowIds }
      })
        .then(removeStatus => {
          emptyBulk();

          const status = removeStatus.data.flowsRemove;
          getRefetchQueries();

          status === 'deleted'
            ? Alert.success('You successfully deleted a flow')
            : Alert.warning('Flow status deleted');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const updatedProps = {
      ...this.props,
      queryParams,
      flows: flowsQuery.flows || [],
      remove,
      addFlow,
      loading: flowsQuery.loading,
      searchValue: this.props.queryParams.searchValue || '',
      flowsTotalCount: flowTotalCountQuery.flowTotalCount || 0
    };

    const flowList = props => {
      return <List {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.flowsQuery.refetch();
    };

    return <Bulk content={flowList} refetch={refetch} />;
  }
}

const getRefetchQueries = () => {
  return ['flows', 'flowsMain', 'flowCategories', 'flowTotalCount'];
};

const options = () => ({
  refetchQueries: getRefetchQueries()
});

const generateFilter = qp => {
  return {
    categoryId: qp.categoryId,
    searchValue: qp.searchValue,
    branchId: qp.branchId,
    departmentId: qp.departmentId,
    status: qp.status,
    validation: qp.validation
  };
};

export default withProps<Props>(
  compose(
    graphql<Props, FlowsQueryResponse, { page: number; perPage: number }>(
      gql(queries.flowsMain),
      {
        name: 'flowsQuery',
        options: ({ queryParams }) => ({
          variables: {
            ...generateFilter(queryParams),
            ...generatePaginationParams(queryParams)
          },
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql<Props, flowTotalCountQueryResponse>(gql(queries.flowTotalCount), {
      name: 'flowTotalCountQuery',
      options: ({ queryParams }) => ({
        variables: {
          ...generateFilter(queryParams)
        },
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, flowsRemoveMutationResponse, { flowsIds: string[] }>(
      gql(mutations.flowsRemove),
      {
        name: 'flowsRemove',
        options
      }
    ),
    graphql<{}, FlowsAddMutationResponse, IFlowDocument>(
      gql(mutations.flowsAdd),
      {
        name: 'flowsAdd',
        options: () => ({
          refetchQueries: ['flows', 'flowDetail']
        })
      }
    )
  )(ProductListContainer)
);
