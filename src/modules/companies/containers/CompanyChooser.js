import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { queries, mutations } from '../graphql';
import { Alert, renderFullName } from 'modules/common/utils';
import { Chooser } from 'modules/common/components';
import { CompanyForm } from '../containers';

class CompanyChooser extends React.Component {
  constructor(props) {
    super(props);

    this.state = { perPage: 20 };
  }

  render() {
    const { data, companiesQuery, companiesAdd } = this.props;

    const search = (value, loadmore) => {
      if (!loadmore) {
        this.setState({ perPage: 0 });
      }
      this.setState({ perPage: this.state.perPage + 20 }, () => {
        companiesQuery.refetch({
          searchValue: value,
          perPage: this.state.perPage
        });
      });
    };

    const clearState = () => {
      companiesQuery.refetch({ searchValue: '' });
    };

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
      return data.name || data.website || 'N/A';
    };

    const updatedProps = {
      ...this.props,
      data: {
        name: renderFullName(data),
        datas: data.companies
      },
      search,
      renderName,
      title: 'Company',
      perPage: this.state.perPage,
      form,
      clearState,
      add: addCompany,
      datas: companiesQuery.companies || []
    };

    return <Chooser {...updatedProps} />;
  }
}

CompanyChooser.propTypes = {
  data: PropTypes.object.isRequired,
  companiesQuery: PropTypes.object.isRequired,
  companiesAdd: PropTypes.func.isRequired
};

export default compose(
  graphql(gql(queries.companies), {
    name: 'companiesQuery',
    options: {
      variables: {
        perPage: 20
      }
    }
  }),
  // mutations
  graphql(gql(mutations.companiesAdd), {
    name: 'companiesAdd'
  })
)(CompanyChooser);
