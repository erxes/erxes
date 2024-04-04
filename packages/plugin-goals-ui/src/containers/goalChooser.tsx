import { Chooser, withProps } from '@erxes/ui/src';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';

import { mutations, queries } from '../graphql';
import {
  AddMutationResponse,
  GoalTypesQueryResponse,
  IGoalType,
  IGoalTypeDoc
} from '../types';
import GoalTypeForm from './goalForm';

type Props = {
  search: (value: string, loadMore?: boolean) => void;
  perPage: number;
  searchValue: string;
};

type FinalProps = {
  goalTypesQuery: GoalTypesQueryResponse;
} & Props &
  AddMutationResponse;

class GoalTypeChooser extends React.Component<
  WrapperProps & FinalProps,
  { newGoalType?: IGoalType }
> {
  constructor(props) {
    super(props);

    this.state = {
      newGoalType: undefined
    };
  }

  resetAssociatedItem = () => {
    return this.setState({ newGoalType: undefined });
  };

  render() {
    const { data, goalTypesQuery, search } = this.props;

    const renderName = goalType => {
      return `${goalType.entity} - ${goalType.contributionType} `;
    };

    const getAssociatedGoalType = (newGoalType: IGoalType) => {
      this.setState({ newGoalType });
    };

    const updatedProps = {
      ...this.props,
      data: {
        _id: data._id,
        name: renderName(data),
        datas: data.goalTypes,
        mainTypeId: data.mainTypeId,
        mainType: data.mainType,
        relType: 'goalType'
      },
      search,
      clearState: () => search(''),
      title: 'GoalType',
      renderForm: formProps => (
        <GoalTypeForm
          {...formProps}
          getAssociatedGoalType={getAssociatedGoalType}
        />
      ),
      renderName,
      newItem: this.state.newGoalType,
      resetAssociatedItem: this.resetAssociatedItem,
      datas: goalTypesQuery.goalTypes || [],
      refetchQuery: queries.goalTypes
    };

    return <Chooser {...updatedProps} />;
  }
}

const WithQuery = withProps<Props>(
  compose(
    graphql<
      Props & WrapperProps,
      GoalTypesQueryResponse,
      { searchValue: string; perPage: number }
    >(gql(queries.goalTypes), {
      name: 'goalTypesQuery',
      options: ({ searchValue, perPage, data }) => {
        return {
          variables: {
            searchValue,
            perPage,
            mainType: data.mainType,
            mainTypeId: data.mainTypeId,
            isRelated: data.isRelated,
            sortField: 'createdAt',
            sortDirection: -1
          },
          fetchPolicy: data.isRelated ? 'network-only' : 'cache-first'
        };
      }
    }),
    // mutations
    graphql<{}, AddMutationResponse, IGoalTypeDoc>(
      gql(mutations.goalTypesAdd),
      {
        name: 'goalTypesAdd'
      }
    )
  )(GoalTypeChooser)
);

type WrapperProps = {
  data: {
    _id?: string;
    name: string;
    goalTypes: IGoalType[];
    mainTypeId?: string;
    mainType?: string;
    isRelated?: boolean;
  };
  onSelect: (datas: IGoalType[]) => void;
  closeModal: () => void;
};

export default class Wrapper extends React.Component<
  WrapperProps,
  {
    perPage: number;
    searchValue: string;
  }
> {
  constructor(props) {
    super(props);

    this.state = { perPage: 20, searchValue: '' };
  }

  search = (value, loadmore) => {
    let perPage = 20;

    if (loadmore) {
      perPage = this.state.perPage + 20;
    }

    return this.setState({ perPage, searchValue: value });
  };

  render() {
    const { searchValue, perPage } = this.state;

    return (
      <WithQuery
        {...this.props}
        search={this.search}
        searchValue={searchValue}
        perPage={perPage}
      />
    );
  }
}
