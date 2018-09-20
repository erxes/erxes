import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Alert } from 'modules/common/utils';
import Twitter from 'modules/settings/integrations/components/twitter/Form';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';

type Props = {
  type: string;
  history: any;
  queryParams: any;
  brandsQuery: any;
  twitterAuthUrlQuery: any;
  saveMutation: (params: { variables: { brandId: string, queryParams: any } }) => Promise<any>;
};

const TwitterContainer = (props: Props) => {
  const {
    brandsQuery,
    twitterAuthUrlQuery,
    history,
    type,
    queryParams,
    saveMutation
  } = props;

  if (brandsQuery.loading || twitterAuthUrlQuery.loading) {
    return <Spinner />;
  }

  if (type === 'link') {
    window.location.href = twitterAuthUrlQuery.integrationGetTwitterAuthUrl;
    return <Spinner />;
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
