import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { queries, mutations } from '../graphql';
import {
  mutations as customerMutations,
  queries as customerQueries
} from 'modules/customers/graphql';
import { Alert, renderFullName } from 'modules/common/utils';
import { CommonAssociate } from 'modules/customers/components';
import { CompanyForm } from '../components';

class CompanyAssociateContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      perPage: 20
    };
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

    const form = <CompanyForm addCompany={addCompany} />;

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

    return <CommonAssociate {...updatedProps} />;
  }
}

CompanyAssociateContainer.propTypes = {
  data: PropTypes.object.isRequired,
  companiesQuery: PropTypes.object.isRequired,
  companiesAdd: PropTypes.func.isRequired
};

const CustomerEditCompaniesContainer = props => {
  const { customersEditCompanies, data } = props;

  const save = companies => {
    const companyIds = [];

    companies.forEach(data => {
      companyIds.push(data._id.toString());
    });

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

  const extendedProps = {
    ...props,
    save
  };

  return <CompanyAssociateContainer {...extendedProps} />;
};

CustomerEditCompaniesContainer.propTypes = {
  customersEditCompanies: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired
};

const CustomerEditCompanies = compose(
  graphql(gql(customerMutations.customersEditCompanies), {
    name: 'customersEditCompanies',
    options: ({ data }) => ({
      refetchQueries: [
        {
          query: gql`
            ${customerQueries.customerDetail}
          `,
          variables: { _id: data._id }
        }
      ]
    })
  })
)(CustomerEditCompaniesContainer);

const MainContainer = props => {
  const { data } = props;

  if (data._id) {
    return <CustomerEditCompanies {...props} />;
  }

  return <CompanyAssociateContainer {...props} />;
};

MainContainer.propTypes = {
  calledFromOthers: PropTypes.bool
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
)(MainContainer);
