import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Alert, withProps } from 'modules/common/utils';
import Twitter from 'modules/settings/integrations/components/twitter/Form';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { BrandsQueryResponse } from '../../../brands/types';
import {
  GetTwitterAuthUrlQueryResponse,
  SaveTwitterMutationResponse,
  TwitterAuthParams
} from '../../types';

type Props = {
  type: string;
  history?: any;
  queryParams?: any;
};

type FinalProps = {
  brandsQuery: BrandsQueryResponse;
  twitterAuthUrlQuery: GetTwitterAuthUrlQueryResponse;
} & Props &
  SaveTwitterMutationResponse;

const TwitterContainer = (props: FinalProps) => {
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

export default withProps<Props>(
  compose(
    graphql<Props, BrandsQueryResponse>(
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
    graphql<Props, GetTwitterAuthUrlQueryResponse>(
      gql`
        query integrationGetTwitterAuthUrl {
          integrationGetTwitterAuthUrl
        }
      `,
      { name: 'twitterAuthUrlQuery' }
    ),
    graphql<
      Props,
      SaveTwitterMutationResponse,
      { brandId: string; queryParams: TwitterAuthParams }
    >(
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
  )(TwitterContainer)
);
