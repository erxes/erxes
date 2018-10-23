import gql from 'graphql-tag';
import { Chooser } from 'modules/common/components';
import { Alert, withProps } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { CompanyForm } from '.';
import { mutations, queries } from '../graphql';
import { ICompany, ICompanyDoc } from '../types';

type AddMutationResponse = {
  companiesAdd: (params: { variables: ICompanyDoc }) => Promise<any>;
};

type CompaniesQueryResponse = {
  companies: ICompany[];
  loading: boolean;
};

type Props = {
  search: (value: string, loadMore?: boolean) => void;
  perPage: number;
  searchValue: string;
};

type FinalProps = {
  companiesQuery: any;
} & Props &
  AddMutationResponse;

const CompanyChooser = (props: WrapperProps & FinalProps) => {
  const { data, companiesQuery, companiesAdd, search } = props;
  // add company
  const addCompany = ({ doc, callback }) => {
    companiesAdd({
      variables: doc
    })
      .then(() => {
        companiesQuery.refetch();

        Alert.success('Success');

        callback();
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const renderName = company => {
    return company.primaryName || company.website || 'N/A';
  };

  const updatedProps = {
    ...props,
    data: {
      _id: data._id,
      name: renderName(data),
      datas: data.companies
    },
    search,
    clearState: () => search(''),
    title: 'Company',
    renderForm: formProps => <CompanyForm {...formProps} action={addCompany} />,
    renderName,
    add: addCompany,
    datas: companiesQuery.companies || []
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
    // mutations
    graphql<{}, AddMutationResponse, ICompanyDoc>(gql(mutations.companiesAdd), {
      name: 'companiesAdd'
    })
  )(CompanyChooser)
);

type WrapperProps = {
  data: { _id?: string; name: string; companies: ICompany[] };
  onSelect: (datas: ICompany[]) => void;
  closeModal: () => void;
};

export default class Wrapper extends React.Component<
  WrapperProps,
  { perPage: number; searchValue: string }
> {
  constructor(props) {
    super(props);

    this.state = { perPage: 20, searchValue: '' };

    this.search = this.search.bind(this);
  }

  search(value, loadmore) {
    let perPage = 20;

    if (loadmore) {
      perPage = this.state.perPage + 20;
    }

    return this.setState({ perPage, searchValue: value });
  }

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
