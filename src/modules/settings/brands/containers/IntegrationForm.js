import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { queries, mutations } from '../graphql';
import { IntegrationForm } from '../components';
import { Alert } from 'modules/common/utils';

class FormContainer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      perPage: 20
    };
  }

  render() {
    const {
      currentBrand,
      allIntegrationsQuery,
      manageIntegrations
    } = this.props;

    const search = (value, loadmore) => {
      if (!loadmore) {
        this.setState({ perPage: 0 });
      }
      this.setState({ perPage: this.state.perPage + 20 }, () => {
        allIntegrationsQuery.refetch({
          searchValue: value,
          perPage: this.state.perPage
        });
      });
    };

    const save = integrationIds => {
      manageIntegrations({
        variables: {
          _id: currentBrand._id,
          integrationIds
        }
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
      search,
      save,
      perPage: this.state.perPage,
      refetch: allIntegrationsQuery.refetch,
      allIntegrations: allIntegrationsQuery.integrations || []
    };

    return <IntegrationForm {...updatedProps} />;
  }
}

FormContainer.propTypes = {
  currentBrand: PropTypes.object,
  allIntegrationsQuery: PropTypes.object,
  manageIntegrations: PropTypes.func
};

export default compose(
  graphql(gql(queries.integrations), {
    name: 'allIntegrationsQuery',
    options: {
      variables: {
        perPage: 20
      }
    }
  }),
  graphql(gql(mutations.brandManageIntegrations), {
    name: 'manageIntegrations',
    options: ({ currentBrand }) => {
      return {
        refetchQueries: [
          {
            query: gql(queries.integrations),
            variables: {
              brandId: currentBrand._id,
              perPage: 20
            }
          },
          {
            query: gql(queries.brandDetail),
            variables: { _id: currentBrand._id }
          }
        ]
      };
    }
  })
)(FormContainer);
