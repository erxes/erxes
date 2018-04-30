import React, { Component } from 'react';
import { withRouter } from 'react-router';
import PropTypes from 'prop-types';
import { compose, graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import { Facebook } from '../components';

class FacebookContainer extends Component {
  constructor(props) {
    super(props);

    this.onAppSelect = this.onAppSelect.bind(this);
    this.state = { pages: [] };
  }

  onAppSelect(appId) {
    this.props.client
      .query({
        query: gql`
          query integrationFacebookPagesList($appId: String) {
            integrationFacebookPagesList(appId: $appId)
          }
        `,

        variables: {
          appId
        }
      })

      .then(({ data, loading }) => {
        if (!loading) {
          this.setState({ pages: data.integrationFacebookPagesList });
        }
      })

      .catch(error => {
        Alert.error(error.message);
      });
  }

  render() {
    const {
      history,
      brandsQuery,
      integrationFacebookAppsListQuery,
      saveMutation
    } = this.props;

    if (brandsQuery.loading || integrationFacebookAppsListQuery.loading) {
      return <Spinner objective />;
    }

    const brands = brandsQuery.brands;

    const save = variables => {
      saveMutation({ variables })
        .then(() => {
          Alert.success('Congrats');
          history.push('/settings/integrations');
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const updatedProps = {
      brands,
      apps: integrationFacebookAppsListQuery.integrationFacebookAppsList,
      pages: this.state.pages,
      onAppSelect: this.onAppSelect,
      save
    };

    return <Facebook {...updatedProps} />;
  }
}

FacebookContainer.propTypes = {
  client: PropTypes.object,
  history: PropTypes.object,
  type: PropTypes.string,
  integrationFacebookAppsListQuery: PropTypes.object,
  saveMutation: PropTypes.func,
  brandsQuery: PropTypes.object
};

export default withRouter(
  compose(
    graphql(
      gql`
        query brands {
          brands {
            _id
            name
          }
        }
      `,
      {
        name: 'brandsQuery',
        options: () => ({
          fetchPolicy: 'network-only'
        })
      }
    ),
    graphql(
      gql`
        query integrationFacebookAppsList {
          integrationFacebookAppsList
        }
      `,
      { name: 'integrationFacebookAppsListQuery' }
    ),
    graphql(
      gql`
        mutation integrationsCreateFacebookIntegration(
          $brandId: String!
          $name: String!
          $appId: String!
          $pageIds: [String!]!
        ) {
          integrationsCreateFacebookIntegration(
            brandId: $brandId
            name: $name
            appId: $appId
            pageIds: $pageIds
          ) {
            _id
          }
        }
      `,
      { name: 'saveMutation' }
    ),
    withApollo
  )(FacebookContainer)
);
