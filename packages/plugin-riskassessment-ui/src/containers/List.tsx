import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { Alert, commonListComposer, confirm } from '@erxes/ui/src/utils';
import List from '../components/List';
import { mutations, queries } from '../graphql';
import React from 'react';
import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';
import { ICommonListProps, RiskAssesmentsCategoriesQueryResponse } from '../common/types';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { RiskAssesmentsListQueryResponse } from '../common/types';

type Props = ICommonListProps &
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
      loading,
      remove,
    };

    return <List {...updatedProps} />;
  }
}

export default commonListComposer<Props>({
  text: 'list',
  label: 'riskassessments',
  stringAddMutation: mutations.riskAssessmentAdd,
  stringRemoveMutation: mutations.riskAssesmentRemove,
  stringEditMutation: mutations.riskAssessmentUpdate,

  gqlListQuery: graphql(gql(queries.list), {
    name: 'listQuery',
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
