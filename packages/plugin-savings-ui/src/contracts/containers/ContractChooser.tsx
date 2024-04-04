import { Chooser, withProps } from '@erxes/ui/src';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';

import { mutations, queries } from '../graphql';
import {
  AddMutationResponse,
  ContractsQueryResponse,
  IContract,
  IContractDoc
} from '../types';
import ContractForm from './ContractForm';

type Props = {
  search: (value: string, loadMore?: boolean) => void;
  perPage: number;
  searchValue: string;
};

type FinalProps = {
  contractsQuery: ContractsQueryResponse;
} & Props &
  AddMutationResponse;

class ContractChooser extends React.Component<
  WrapperProps & FinalProps,
  { newContract?: IContract }
> {
  // TODO: Энэ гэрээ сонгох нь шинээр нэмэх л эрхтэй байхаар тооцно
  constructor(props) {
    super(props);

    this.state = {
      newContract: undefined
    };
  }

  resetAssociatedItem = () => {
    return this.setState({ newContract: undefined });
  };

  render() {
    const { data, contractsQuery, search } = this.props;

    const renderName = contract => {
      return contract.number;
    };

    const getAssociatedContract = (newContract: IContract) => {
      this.setState({ newContract });
    };

    const updatedProps = {
      ...this.props,
      data: {
        _id: data._id,
        name: renderName(data),
        datas: data.contracts,
        mainTypeId: data.mainTypeId,
        mainType: data.mainType,
        relType: 'contract'
      },
      search,
      clearState: () => search(''),
      title: 'Contract',
      renderForm: formProps => (
        <ContractForm
          {...formProps}
          getAssociatedContract={getAssociatedContract}
        />
      ),
      renderName,
      newItem: this.state.newContract,
      resetAssociatedItem: this.resetAssociatedItem,
      datas: contractsQuery.contracts || [],
      refetchQuery: queries.contracts
    };

    return <Chooser limit={1} {...updatedProps} />;
  }
}

const WithQuery = withProps<Props>(
  compose(
    graphql<
      Props & WrapperProps,
      ContractsQueryResponse,
      { searchValue: string; perPage: number }
    >(gql(queries.contracts), {
      name: 'contractsQuery',
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
    graphql<{}, AddMutationResponse, IContractDoc>(
      gql(mutations.contractsAdd),
      {
        name: 'contractsAdd'
      }
    )
  )(ContractChooser)
);

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
