import { ICommonFormProps } from '@erxes/ui-settings/src/common/types'
import { IButtonMutateProps, IRouterProps } from '@erxes/ui/src/types'
import { Alert, commonListComposer, confirm, router } from '@erxes/ui/src/utils'
import gql from 'graphql-tag'
import React from 'react'
import { graphql } from 'react-apollo'
import {
  ICommonListProps,
  RiskAssesmentsCategoriesQueryResponse,
  RiskAssesmentsListQueryResponse
} from '../common/types'
import List from '../components/List'
import { mutations, queries } from '../graphql'

type Props = IRouterProps &
  ICommonListProps &
  ICommonFormProps & {
    queryParams: any;
    history: any;
    renderButton: (props: IButtonMutateProps) => JSX.Element;
    listQuery: RiskAssesmentsListQueryResponse;
    removeMutation: any;
    categories: RiskAssesmentsCategoriesQueryResponse;
  };

class ListContainer extends React.Component<Props> {
  render() {
    const { removeMutation, listQuery } = this.props;

    const { riskAssesments, loading } = listQuery;

    const remove = (_ids: string[]) => {
      confirm('Are you sure?').then(() => {
        removeMutation({ variables: { _ids } })
          .then(() => {
            Alert.success('You successfully removed risk assesments');
          })
          .catch((e) => {
            Alert.error(e.message);
          });
      });
    };

    const updatedProps = {
      ...this.props,
      list: riskAssesments?.list,
      totalCount: riskAssesments?.totalCount,
      refetch: listQuery.refetch,
      loading,
      remove,
    };

    return <List {...updatedProps} />;
  }
}

const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  ids: queryParams.ids,
  campaignId: queryParams.campaignId,
  status: queryParams.status,
  ownerId: queryParams.ownerId,
  ownerType: queryParams.ownerType,
  searchValue: queryParams.searchValue,
  sortField: queryParams.sortField,
  sortDirection: Number(queryParams.sortDirection) || undefined,
  sortFromDate: queryParams.From || undefined,
  sortToDate: queryParams.To || undefined,
  categoryId:queryParams.categoryId
});

export default commonListComposer<Props>({
  text: 'list',
  label: 'riskassessments',
  stringAddMutation: mutations.riskAssessmentAdd,
  stringRemoveMutation: mutations.riskAssesmentRemove,
  stringEditMutation: mutations.riskAssessmentUpdate,

  gqlListQuery: graphql<Props>(gql(queries.list), {
    name: 'listQuery',
    options: ({ queryParams }) => ({
      variables: generateParams({ queryParams }),
    }),
  }),

  gqlTotalCountQuery: graphql(gql(queries.totalCount), {
    name: 'totalCountQuery',
  }),

  gqlAddMutation: graphql(gql(mutations.riskAssessmentAdd), {
    name: 'addMutation',
  }),
  gqlRemoveMutation: graphql(gql(mutations.riskAssesmentRemove), {
    name: 'removeMutation',
    options: () => ({
      refetchQueries: [{ query: gql(queries.list) }],
    }),
  }),
  gqlEditMutation: graphql(gql(mutations.riskAssessmentUpdate), {
    name: 'editMutation',
    options: () => ({
      refetchQueries: [{ query: gql(queries.list) }],
    }),
  }),
  ListComponent: ListContainer,
});
