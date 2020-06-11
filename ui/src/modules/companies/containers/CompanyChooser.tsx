import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from 'modules/common/utils';
import ConformityChooser from 'modules/conformity/containers/ConformityChooser';
import React from 'react';
import { graphql } from 'react-apollo';
import { mutations, queries } from '../graphql';
import {
  AddMutationResponse,
  CompaniesQueryResponse,
  ICompany,
  ICompanyDoc
} from '../types';
import CompanyForm from './CompanyForm';

type Props = {
  search: (value: string, loadMore?: boolean) => void;
  perPage: number;
  searchValue: string;
};

type FinalProps = {
  companiesQuery: CompaniesQueryResponse;
} & Props &
  AddMutationResponse;

class CompanyChooser extends React.Component<
  WrapperProps & FinalProps,
  { newCompany?: ICompany }
> {
  constructor(props) {
    super(props);

    this.state = {
      newCompany: undefined
    };
  }

  resetAssociatedItem = () => {
    return this.setState({ newCompany: undefined });
  };

  render() {
    const { data, companiesQuery, search } = this.props;

    const renderName = company => {
      return company.primaryName || company.website || 'Unknown';
    };

    const getAssociatedCompany = (newCompany: ICompany) => {
      this.setState({ newCompany });
    };

    const updatedProps = {
      ...this.props,
      data: {
        _id: data._id,
        name: renderName(data),
        datas: data.companies,
        mainTypeId: data.mainTypeId,
        mainType: data.mainType,
        relType: 'company'
      },
      search,
      clearState: () => search(''),
      title: 'Company',
      renderForm: formProps => (
        <CompanyForm
          {...formProps}
          getAssociatedCompany={getAssociatedCompany}
        />
      ),
      renderName,
      newItem: this.state.newCompany,
      resetAssociatedItem: this.resetAssociatedItem,
      datas: companiesQuery.companies || [],
      refetchQuery: queries.companies
    };

    return <ConformityChooser {...updatedProps} />;
  }
}

const WithQuery = withProps<Props>(
  compose(
    graphql<
      Props & WrapperProps,
      CompaniesQueryResponse,
      { searchValue: string; perPage: number }
    >(gql(queries.companies), {
      name: 'companiesQuery',
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
    graphql<{}, AddMutationResponse, ICompanyDoc>(gql(mutations.companiesAdd), {
      name: 'companiesAdd'
    })
  )(CompanyChooser)
);

type WrapperProps = {
  data: {
    _id?: string;
    name: string;
    companies: ICompany[];
    mainTypeId?: string;
    mainType?: string;
    isRelated?: boolean;
  };
  onSelect: (datas: ICompany[]) => void;
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
