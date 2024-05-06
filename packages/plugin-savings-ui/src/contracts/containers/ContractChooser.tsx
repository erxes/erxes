import { Chooser } from '@erxes/ui/src';
import { gql } from '@apollo/client';
import React, { useState } from 'react';

import { queries } from '../graphql';
import { ContractsQueryResponse, IContract } from '../types';
import ContractForm from './ContractForm';
import { useQuery } from '@apollo/client';

type Props = {
  search: (value: string, loadMore?: boolean) => void;
  perPage: number;
  searchValue: string;
};

const ContractChooser = (props: Props & WrapperProps) => {
  // TODO: Энэ гэрээ сонгох нь шинээр нэмэх л эрхтэй байхаар тооцно
  const [newContract, setNewContract] = useState(undefined as any);

  const { data, search, searchValue, perPage } = props;

  const contractsQuery = useQuery<ContractsQueryResponse>(
    gql(queries.contracts),
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
    setNewContract(undefined);
  };

  const renderName = (contract) => {
    return contract.number;
  };

  const getAssociatedContract = (newContract: IContract) => {
    setNewContract(newContract);
  };

  const updatedProps = {
    ...props,
    data: {
      _id: data._id,
      name: renderName(data),
      datas: data.contracts,
      mainTypeId: data.mainTypeId,
      mainType: data.mainType,
      relType: 'contract',
    },
    search,
    clearState: () => search(''),
    title: 'Contract',
    renderForm: (formProps) => (
      <ContractForm
        {...formProps}
        getAssociatedContract={getAssociatedContract}
      />
    ),
    renderName,
    newItem: newContract,
    resetAssociatedItem: resetAssociatedItem,
    datas: contractsQuery?.data?.contracts || [],
    refetchQuery: queries.contracts,
  };

  return <Chooser limit={1} {...updatedProps} />;
};

type WrapperProps = {
  data: {
    _id?: string;
    name: string;
    contracts: IContract[];
    mainTypeId?: string;
    mainType?: string;
    isRelated?: boolean;
  };
  onSelect: (datas: IContract[]) => void;
  closeModal: () => void;
};

const Wrapper = (props: WrapperProps) => {
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
    <ContractChooser
      {...props}
      search={search}
      searchValue={searchValue}
      perPage={perPage}
    />
  );
};

export default Wrapper;
