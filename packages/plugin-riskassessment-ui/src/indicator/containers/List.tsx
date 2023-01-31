import { ICommonFormProps } from '@erxes/ui-settings/src/common/types';
import { ButtonMutate } from '@erxes/ui/src';
import { IButtonMutateProps, IRouterProps } from '@erxes/ui/src/types';
import { Alert, confirm, router } from '@erxes/ui/src/utils';
import { withProps } from '@erxes/ui/src/utils/core';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';
import { ICommonListProps } from '../../common/types';
import {
  RiskAssessmentsCategoriesQueryResponse,
  RiskIndicatorsListQueryResponse,
  RiskIndicatorsTotalCountQueryResponse
} from '../common/types';
import List from '../components/List';
import { mutations, queries } from '../graphql';

type Props = {
  queryParams: any;
  history: any;
};

type FinalProps = {
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  listQuery: RiskIndicatorsListQueryResponse;
  totalCountQuery: RiskIndicatorsTotalCountQueryResponse;
  removeMutation: any;
  categories: RiskAssessmentsCategoriesQueryResponse;
} & Props &
  ICommonListProps &
  IRouterProps &
  ICommonFormProps;
class ListContainer extends React.Component<FinalProps> {
  render() {
    const { removeMutation, listQuery, totalCountQuery } = this.props;

    const { riskIndicators, loading } = listQuery;

    const remove = (_ids: string[]) => {
      confirm('Are you sure?').then(() => {
        removeMutation({ variables: { _ids } })
          .then(() => {
            listQuery.refetch();
            Alert.success('You successfully removed risk assesments');
          })
          .catch(e => {
            Alert.error(e.message);
          });
      });
    };

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback,
      confirmationUpdate,
      object
    }: IButtonMutateProps) => {
      const afterMutate = () => {
        listQuery.refetch();
        if (callback) {
          callback();
        }
      };
      let mutation = mutations.riskIndicatorAdd;
      let successAction = 'added';
      if (object) {
        mutation = mutations.riskIndicatorUpdate;
        successAction = 'updated';
      }
      return (
        <ButtonMutate
          mutation={mutation}
          variables={values}
          callback={afterMutate}
          isSubmitted={isSubmitted}
          type="submit"
          confirmationUpdate={confirmationUpdate}
          successMessage={`You successfully ${successAction} a ${name}`}
        />
      );
    };

    const updatedProps = {
      ...this.props,
      list: riskIndicators,
      totalCount: totalCountQuery?.riskIndicatorsTotalCount || 0,
      refetch: listQuery.refetch,
      loading,
      remove,
      renderButton
    };

    return <List {...updatedProps} />;
  }
}

export const generateParams = ({ queryParams }) => ({
  ...router.generatePaginationParams(queryParams || {}),
  ids: queryParams.ids,
  searchValue: queryParams.searchValue,
  sortField: queryParams.sortField,
  sortDirection: Number(queryParams.sortDirection) || undefined,
  sortFromDate: queryParams.from || undefined,
  sortToDate: queryParams.to || undefined,
  categoryId: queryParams.categoryId
});

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.list), {
      name: 'listQuery',
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams })
      })
    }),
    graphql<Props>(gql(queries.totalCount), {
      name: 'totalCountQuery',
      options: ({ queryParams }) => ({
        variables: generateParams({ queryParams })
      })
    }),
    graphql(gql(mutations.riskIndicatorAdd), {
      name: 'addMutation'
    }),
    graphql(gql(mutations.riskIndicatorRemove), {
      name: 'removeMutation'
    }),
    graphql(gql(mutations.riskIndicatorUpdate), {
      name: 'editMutation'
    })
  )(ListContainer)
);
