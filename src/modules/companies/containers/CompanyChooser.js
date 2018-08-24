import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Chooser } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { CompanyForm } from '../containers';
import { queries, mutations } from '../graphql';

const CompanyChooser = props => {
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

  const renderName = data => {
    return data.primaryName || data.website || 'N/A';
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

CompanyChooser.propTypes = {
  data: PropTypes.object.isRequired,
  companiesQuery: PropTypes.object.isRequired,
  companiesAdd: PropTypes.func.isRequired,
  search: PropTypes.func.isRequired
};

const WithQuery = compose(
  graphql(gql(queries.companies), {
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
  graphql(gql(mutations.companiesAdd), {
    name: 'companiesAdd'
  })
)(CompanyChooser);

export default class Wrapper extends React.Component {
  constructor(props) {
    super(props);

    this.state = { perPage: 20 };

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
