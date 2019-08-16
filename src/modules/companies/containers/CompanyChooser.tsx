import gql from 'graphql-tag';
import Chooser from 'modules/common/components/Chooser';
import { Alert, withProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import { mutations, queries } from '../graphql';
import {
  AddMutationResponse,
  CompaniesQueryResponse,
  ICompany,
  ICompanyDoc,
  RelatedCompaniesQueryResponse
} from '../types';
import CompanyForm from './CompanyForm';

type Props = {
  search: (value: string, loadMore?: boolean) => void;
  perPage: number;
  searchValue: string;
  mainTypeId?: string;
  mainType?: string;
};

type FinalProps = {
  companiesQuery: CompaniesQueryResponse;
  relatedCompaniesQuery: RelatedCompaniesQueryResponse;
} & Props &
  AddMutationResponse;

const CompanyChooser = (props: WrapperProps & FinalProps) => {
  const {
    data,
    companiesQuery,
    companiesAdd,
    relatedCompaniesQuery,
    search
  } = props;
  // add company
  const addCompany = ({ doc, callback }) => {
    companiesAdd({
      variables: doc
    })
      .then(() => {
        companiesQuery.refetch();

        Alert.success('You successfully added a company');

        callback();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const renderName = company => {
    return company.primaryName || company.website || 'Unknown';
  };

  const datas =
    data.mainTypeId && data.mainType
      ? relatedCompaniesQuery.relatedCompanies
      : companiesQuery.companies;

  const updatedProps = {
    ...props,
    data: {
      _id: data._id,
      name: renderName(data),
      datas: data.companies,
      mainTypeId: data.mainTypeId,
      mainType: data.mainType
    },
    search,
    clearState: () => search(''),
    title: 'Company',
    renderForm: formProps => <CompanyForm {...formProps} action={addCompany} />,
    renderName,
    add: addCompany,
    datas: datas || []
  };

  return <Chooser {...updatedProps} />;
};

const WithQuery = withProps<Props>(
  compose(
    graphql<
      Props,
      CompaniesQueryResponse,
      { searchValue: string; perPage: number }
    >(gql(queries.companies), {
      name: 'companiesQuery',
      options: ({ searchValue, perPage }) => {
        return {
          variables: {
            searchValue,
            perPage
          }
        };
      }
    }),
    graphql<
      Props,
      RelatedCompaniesQueryResponse,
      {
        searchValue: string;
        perPage: number;
        mainType?: string;
        mainTypeId?: string;
      }
    >(gql(queries.relatedCompanies), {
      name: 'relatedCompaniesQuery',
      options: ({ searchValue, perPage, mainType, mainTypeId }) => {
        return {
          variables: {
            searchValue,
            perPage,
            mainType,
            mainTypeId
          }
          // fetchPolicy: 'network-only'
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
  };
  onSelect: (datas: ICompany[]) => void;
  closeModal: () => void;
};

export default class Wrapper extends React.Component<
  WrapperProps,
  {
    perPage: number;
    searchValue: string;
    mainTypeId?: string;
    mainType?: string;
  }
> {
  constructor(props) {
    super(props);

    this.state = { perPage: 20, searchValue: '', mainTypeId: '', mainType: '' };
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
        mainTypeId={this.props.data.mainTypeId}
        mainType={this.props.data.mainType}
      />
    );
  }
}
