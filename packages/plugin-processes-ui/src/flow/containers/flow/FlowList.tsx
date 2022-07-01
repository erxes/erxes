import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import Bulk from '@erxes/ui/src/components/Bulk';
import { Alert, withProps } from '@erxes/ui/src/utils';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import React from 'react';
import { graphql } from 'react-apollo';
import List from '../../components/flow/FlowList';
import { mutations, queries } from '../../graphql';
import {
  CategoryDetailQueryResponse,
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
  productCategoryDetailQuery: CategoryDetailQueryResponse;
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

    const addFlow = () => {
      flowsAdd({
        variables: {
          name: 'Your flow title',
          status: 'draft'
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
      flowsTotalCount: flowTotalCountQuery.flowTotalCount || 0,
      currentCategory: {}
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
  return ['flows', 'flowCategories', 'flowTotalCount'];
};

const options = () => ({
  refetchQueries: getRefetchQueries()
});

export default withProps<Props>(
  compose(
    graphql<Props, FlowsQueryResponse, { page: number; perPage: number }>(
      gql(queries.flows),
      {
        name: 'flowsQuery',
        options: ({ queryParams }) => ({
          variables: {
            categoryId: queryParams.categoryId,
            searchValue: queryParams.searchValue,
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
          searchValue: queryParams.searchValue,
          ...generatePaginationParams(queryParams)
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
          refetchQueries: ['flows', 'flowDetail', 'jobRefersAll']
        })
      }
    )
  )(ProductListContainer)
);
