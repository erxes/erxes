import Chooser from '@erxes/ui/src/components/Chooser';
import { gql, useQuery  } from '@apollo/client';
import React, { useState } from 'react';

import { queries } from '../graphql';
import { ContractTypesQueryResponse, IContractType } from '../types';
import ContractTypeForm from './ContractTypeForm';


type Props = {
  search: (value: string, loadMore?: boolean) => void;
  perPage: number;
  searchValue: string;
};

const ContractTypeChooser = (props: Props & WrapperProps) => {
  const [newContractType, setNewContractType] = useState(undefined as any);
  const { searchValue, perPage, data, search } = props;

  const contractTypesQuery = useQuery<ContractTypesQueryResponse>(
    gql(queries.contractTypes),
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

  const resetAssociatedItem = () => {
    setNewContractType(undefined);
  };

  const renderName = (contractType) => {
    return `${contractType.code} - ${contractType.name} (${contractType.percent})`;
  };

  const getAssociatedContractType = (newContractType: IContractType) => {
    setNewContractType(newContractType);
  };

  const updatedProps = {
    ...props,
    data: {
      _id: data._id,
      name: renderName(data),
      datas: data.contractTypes,
      mainTypeId: data.mainTypeId,
      mainType: data.mainType,
      relType: 'contractType',
    },
    search,
    clearState: () => search(''),
    title: 'ContractType',
    renderForm: (formProps) => (
      <ContractTypeForm
        {...formProps}
        getAssociatedContractType={getAssociatedContractType}
      />
    ),
    renderName,
    newItem: newContractType,
    resetAssociatedItem: resetAssociatedItem,
    datas: contractTypesQuery?.data?.contractTypes || [],
    refetchQuery: queries.contractTypes,
  };

  return <Chooser {...updatedProps} />;
};

type WrapperProps = {
  data: {
    _id?: string;
    name: string;
    contractTypes: IContractType[];
    mainTypeId?: string;
    mainType?: string;
    isRelated?: boolean;
  };
  onSelect: (datas: IContractType[]) => void;
  closeModal: () => void;
};

export default function Wrapper(props: WrapperProps) {
  const [perPage, setPerPage] = useState(20);
  const [searchValue, setSearchValue] = useState('');

  const search = (value, loadmore) => {
    let perPage = 20;

    if (loadmore) {
      perPage = perPage + 20;
    }

    setPerPage(perPage);
    setSearchValue(value);
  };

  return (
    <ContractTypeChooser
      {...props}
      search={search}
      searchValue={searchValue}
      perPage={perPage}
    />
  );
}
