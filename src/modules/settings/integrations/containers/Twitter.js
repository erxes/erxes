import React from 'react';
import PropTypes from 'prop-types';
import { compose, gql, graphql } from 'react-apollo';
import { Alert } from 'modules/common/utils';
import { Twitter } from '../components';

const TwitterContainer = props => {
  const {
    brandsQuery,
    twitterAuthUrlQuery,
    history,
    type,
    queryParams,
    saveMutation
  } = props;

  if (brandsQuery.loading || twitterAuthUrlQuery.loading) {
    return null;
  }

  if (type === 'link') {
    window.location.href = twitterAuthUrlQuery.integrationGetTwitterAuthUrl;
  }

  const brands = brandsQuery.brands;

  const save = brandId => {
    saveMutation({
      variables: {
        brandId,
        queryParams
      }
    })
      .then(() => {
        Alert.success('Congrats');
        history.push('/settings/integrations');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props,
    brands,
    save
  };

  return <Twitter {...updatedProps} />;
};

TwitterContainer.propTypes = {
  type: PropTypes.string,
  history: PropTypes.object,
  queryParams: PropTypes.object,
  brandsQuery: PropTypes.object,
  twitterAuthUrlQuery: PropTypes.object,
  saveMutation: PropTypes.func
};

export default compose(
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
      query integrationGetTwitterAuthUrl {
        integrationGetTwitterAuthUrl
      }
    `,
    { name: 'twitterAuthUrlQuery' }
  ),
  graphql(
    gql`
      mutation save(
        $brandId: String!
        $queryParams: TwitterIntegrationAuthParams!
      ) {
        integrationsCreateTwitterIntegration(
          brandId: $brandId
          queryParams: $queryParams
        ) {
          _id
        }
      }
    `,
    {
      name: 'saveMutation'
    }
  )
)(TwitterContainer);
