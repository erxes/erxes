import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { Alert, withProps } from 'modules/common/utils';
import { queries as brandQueries } from 'modules/settings/brands/graphql';
import Twitter from 'modules/settings/integrations/components/twitter/Form';
import { mutations } from 'modules/settings/integrations/graphql';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { BrandsQueryResponse } from '../../../brands/types';
import {
  LinkTwitterMutationResponse,
  SaveTwitterMutationResponse
} from '../../types';

type Props = {} & LinkTwitterMutationResponse;

type FinalProps = {
  brandsQuery: BrandsQueryResponse;
} & Props &
  SaveTwitterMutationResponse;

class TwitterContainer extends React.Component<FinalProps> {
  save = ({ brandId, accountId }: { brandId: string; accountId: string }) => {
    const { saveMutation } = this.props;

    saveMutation({
      variables: {
        brandId,
        accountId
      }
    })
      .then(() => {
        Alert.success('Congrats');
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  render() {
    const { brandsQuery } = this.props;

    if (brandsQuery.loading) {
      return <Spinner />;
    }

    const brands = brandsQuery.brands;

    const updatedProps = {
      ...this.props,
      brands,
      save: this.save
    };

    return <Twitter {...updatedProps} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<Props, BrandsQueryResponse>(gql(brandQueries.brands), {
      name: 'brandsQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),
    graphql<
      Props,
      SaveTwitterMutationResponse,
      { brandId: string; accountId: string }
    >(gql(mutations.integrationsCreateTwitter), {
      name: 'saveMutation'
    })
  )(TwitterContainer)
);
