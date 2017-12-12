import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { queries, mutations } from '../../graphql';
import { Alert } from 'modules/common/utils';
import { CompanyAssociate } from '../../components';

class CompanyAssociateContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      perPage: 20
    };
  }

  render() {
    const { companiesQuery, companiesAdd, customer } = this.props;

    // add customer
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

    const search = (value, loadmore) => {
      if (loadmore) {
        companiesQuery.refetch({
          searchValue: value,
          perPage: this.state.perPage + 20
        });
      } else {
        this.setState({ perPage: 20 });
        companiesQuery.refetch({
          searchValue: value,
          perPage: this.state.perPage
        });
      }
    };

    const customerFullName = customer => {
      if (customer.firstName || customer.lastName) {
        return (customer.firstName || '') + ' ' + (customer.lastName || '');
      }
      return customer.email || customer.phone;
    };

    const updatedProps = {
      ...this.props,
      customer: {
        _id: customer._id,
        companies: customer.companies,
        fullName: customerFullName(customer)
      },
      search,
      companies: companiesQuery.companies || [],
      addCompany
    };

    return <CompanyAssociate {...updatedProps} />;
  }
}

CompanyAssociateContainer.propTypes = {
  customer: PropTypes.object.isRequired,
  companiesQuery: PropTypes.object.isRequired,
  customersAddCompany: PropTypes.func,
  save: PropTypes.func.isRequired,
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
)(CompanyAssociateContainer);
