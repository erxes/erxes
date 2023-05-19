import { Chooser, withProps } from '@erxes/ui/src';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from 'react-apollo';

import { mutations, queries } from '../graphql';
import {
  AddMutationResponse,
  ContractTypesQueryResponse,
  IContractType,
  IContractTypeDoc
} from '../types';
import ContractTypeForm from './ContractTypeForm';

type Props = {
  search: (value: string, loadMore?: boolean) => void;
  perPage: number;
  searchValue: string;
};

type FinalProps = {
  contractTypesQuery: ContractTypesQueryResponse;
} & Props &
  AddMutationResponse;

class ContractTypeChooser extends React.Component<
  WrapperProps & FinalProps,
  { newContractType?: IContractType }
> {
  constructor(props) {
    super(props);

    this.state = {
      newContractType: undefined
    };
  }

  resetAssociatedItem = () => {
    return this.setState({ newContractType: undefined });
  };

  render() {
    const { data, contractTypesQuery, search } = this.props;

    const renderName = contractType => {
      return `${contractType.code} - ${contractType.name} (${contractType.percent})`;
    };

    const getAssociatedContractType = (newContractType: IContractType) => {
      this.setState({ newContractType });
    };

    const updatedProps = {
      ...this.props,
      data: {
        _id: data._id,
        name: renderName(data),
        datas: data.contractTypes,
        mainTypeId: data.mainTypeId,
        mainType: data.mainType,
        relType: 'contractType'
      },
      search,
      clearState: () => search(''),
      title: 'ContractType',
      renderForm: formProps => (
        <ContractTypeForm
          {...formProps}
          getAssociatedContractType={getAssociatedContractType}
        />
      ),
      renderName,
      newItem: this.state.newContractType,
      resetAssociatedItem: this.resetAssociatedItem,
      datas: contractTypesQuery.contractTypes || [],
      refetchQuery: queries.contractTypes
    };

    return <Chooser {...updatedProps} />;
  }
}

const WithQuery = withProps<Props>(
  compose(
    graphql<
      Props & WrapperProps,
      ContractTypesQueryResponse,
      { searchValue: string; perPage: number }
    >(gql(queries.contractTypes), {
      name: 'contractTypesQuery',
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
    graphql<{}, AddMutationResponse, IContractTypeDoc>(
      gql(mutations.contractTypesAdd),
      {
        name: 'contractTypesAdd'
      }
    )
  )(ContractTypeChooser)
);

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
