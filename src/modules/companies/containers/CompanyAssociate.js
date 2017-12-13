import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { queries, mutations } from '../graphql';
import {
  mutations as customerMutations,
  queries as customerQueries
} from 'modules/customers/graphql';
import { Alert } from 'modules/common/utils';
import { CommonAssociate } from 'modules/customers/components';
import { CompanyForm } from '../components';

class CustomerAssociateContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      perPage: 20
    };
  }

  render() {
    const {
      data,
      companiesQuery,
      companiesAdd,
      customersEditCompanies
    } = this.props;

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

    const form = <CompanyForm addCompany={addCompany} />;

    const save = companyIds => {
      customersEditCompanies({
        variables: { _id: data._id, companyIds }
      })
        .then(() => {
          Alert.success('Successfully saved');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const updatedProps = {
      ...this.props,
      data: {
        _id: data._id,
        datas: data.companies
      },
      search,
      title: 'Company',
      save,
      perPage: this.state.perPage,
      form,
      add: addCompany,
      datas: companiesQuery.companies || []
    };

    return <CommonAssociate {...updatedProps} />;
  }
}

CustomerAssociateContainer.propTypes = {
  data: PropTypes.object.isRequired,
  customersEditCompanies: PropTypes.func.isRequired,
  companiesQuery: PropTypes.object.isRequired,
  companiesAdd: PropTypes.func.isRequired
};

const options = ({ data }) => ({
  refetchQueries: [
    {
      query: gql`${customerQueries.customerDetail}`,
      variables: { _id: data._id }
    }
  ]
});

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
  }),
  graphql(gql(customerMutations.customersEditCompanies), {
    name: 'customersEditCompanies',
    options
  })
)(CustomerAssociateContainer);
