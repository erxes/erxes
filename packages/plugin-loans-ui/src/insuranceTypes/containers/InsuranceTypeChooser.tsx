import { Chooser } from '@erxes/ui/src';
import { gql } from '@apollo/client';
import React, { useState } from 'react';

import { queries } from '../graphql';
import {
  AddMutationResponse,
  InsuranceTypesQueryResponse,
  IInsuranceType,
} from '../types';
import InsuranceTypeForm from './InsuranceTypeForm';
import { useQuery } from '@apollo/client';

type Props = {
  search: (value: string, loadMore?: boolean) => void;
  perPage: number;
  searchValue: string;
};

const InsuranceTypeChooser = (props: Props & WrapperProps) => {
  const [newInsuranceType, setNewInsuranceType] = useState(undefined as any);
  const { data, search, searchValue, perPage } = props;

  const insuranceTypesQuery = useQuery<InsuranceTypesQueryResponse>(
    gql(queries.insuranceTypes),
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
    setNewInsuranceType(undefined);
  };

  const renderName = (insuranceType) => {
    return `${insuranceType.code} - ${insuranceType.name} (${insuranceType.percent})`;
  };

  const getAssociatedInsuranceType = (newInsuranceType: IInsuranceType) => {
    setNewInsuranceType(newInsuranceType);
  };

  const updatedProps = {
    ...props,
    data: {
      _id: data._id,
      name: renderName(data),
      datas: data.insuranceTypes,
      mainTypeId: data.mainTypeId,
      mainType: data.mainType,
      relType: 'insuranceType',
    },
    search,
    clearState: () => search(''),
    title: 'InsuranceType',
    renderForm: (formProps) => (
      <InsuranceTypeForm
        {...formProps}
        getAssociatedInsuranceType={getAssociatedInsuranceType}
      />
    ),
    renderName,
    newItem: newInsuranceType,
    resetAssociatedItem: resetAssociatedItem,
    datas: insuranceTypesQuery?.data?.insuranceTypes || [],
    refetchQuery: queries.insuranceTypes,
  };

  return <Chooser {...updatedProps} />;
};

type WrapperProps = {
  data: {
    _id?: string;
    name: string;
    insuranceTypes: IInsuranceType[];
    mainTypeId?: string;
    mainType?: string;
    isRelated?: boolean;
  };
  onSelect: (datas: IInsuranceType[]) => void;
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
    <InsuranceTypeChooser
      {...props}
      search={search}
      searchValue={searchValue}
      perPage={perPage}
    />
  );
}
