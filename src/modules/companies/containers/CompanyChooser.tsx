import gql from 'graphql-tag';
import { Chooser } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { CompanyForm } from '.';
import { mutations, queries } from '../graphql';
import { ICompanyDoc } from '../types';

type Props = {
  data: any,
  companiesQuery: any,
  companiesAdd: (params: { variables: ICompanyDoc }) => Promise<any>,
  search: (value?: string) => void,
  perPage: number,
  closeModal: () => void
};

const CompanyChooser = (props: WrapperProps & Props) => {
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

  const form = <CompanyForm action={addCompany} />;

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
    form,
    renderName,
    add: addCompany,
    datas: companiesQuery.companies || []
  };

  return <Chooser {...updatedProps} />;
};

const WithQuery = compose(
  graphql(gql(queries.companies), {
    name: 'companiesQuery',
    options: ({ searchValue, perPage }: { searchValue: string, perPage: number }) => {
      return {
        variables: {
          searchValue,
          perPage
        }
      };
    }
  }),
  // mutations
  graphql(gql(mutations.companiesAdd), {
    name: 'companiesAdd'
  })
)(CompanyChooser);

type WrapperProps = {
  data: any,
  onSelect: (datas: any[]) => void,
};

export default class Wrapper extends React.Component<WrapperProps, { perPage: number, searchValue: string }> {
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
