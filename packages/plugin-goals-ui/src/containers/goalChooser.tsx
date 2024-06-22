import { Chooser } from '@erxes/ui/src';
import { gql, useQuery, useMutation } from '@apollo/client';
import React, { useState } from 'react';

import { mutations, queries } from '../graphql';
import {
  AddMutationResponse,
  GoalTypesQueryResponse,
  IGoalType,
  IGoalTypeDoc,
} from '../types';
import GoalTypeForm from './goalForm';

type Props = {
  search: (value: string, loadMore?: boolean) => void;
  perPage: number;
  searchValue: string;
} & WrapperProps;

const GoalTypeChooser = (props: Props) => {
  const { data, searchValue, perPage, search } = props;

  const [goalType, setGoalType] = useState<IGoalType | undefined>(undefined);

  const goalTypesQuery = useQuery<GoalTypesQueryResponse>(
    gql(queries.goalTypes),
    {
      variables: {
        searchValue,
        perPage,
        mainType: data.mainType,
        mainTypeId: data.mainTypeId,
        isRelated: data.isRelated,
        sortField: 'createdAt',
        sortDirection: -1,
      },
      fetchPolicy: data.isRelated ? 'network-only' : 'cache-first',
    },
  );

  const [goalTypesAdd] = useMutation<AddMutationResponse>(
    gql(mutations.goalTypesAdd),
  );

  const resetAssociatedItem = () => {
    return setGoalType(undefined);
  };

  const renderName = (goalType) => {
    return `${goalType.entity} - ${goalType.contributionType} `;
  };

  const getAssociatedGoalType = (newGoalType: IGoalType) => {
    setGoalType(newGoalType);
  };

  const updatedProps = {
    ...props,
    data: {
      _id: data._id,
      name: renderName(data),
      datas: data.goalTypes,
      mainTypeId: data.mainTypeId,
      mainType: data.mainType,
      relType: 'goalType',
    },
    search,
    clearState: () => search(''),
    title: 'GoalType',
    renderForm: (formProps) => (
      <GoalTypeForm
        {...formProps}
        getAssociatedGoalType={getAssociatedGoalType}
      />
    ),
    renderName,
    newItem: goalType,
    resetAssociatedItem,
    datas: goalTypesQuery?.data?.goalTypes || [],
    refetchQuery: queries.goalTypes,
  };

  return <Chooser {...updatedProps} />;
};

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

const Wrapper = (props: WrapperProps) => {
  const [perPage, setPerPage] = useState<number>(20);
  const [searchValue, setSearchValue] = useState<string>('');

  const search = (value, loadmore) => {
    let page = 20;

    if (loadmore) {
      page = page + 20;
    }

    setPerPage(perPage);
    setSearchValue(value);
  };

  return (
    <GoalTypeChooser
      {...props}
      search={search}
      searchValue={searchValue}
      perPage={perPage}
    />
  );
};

export default Wrapper;
