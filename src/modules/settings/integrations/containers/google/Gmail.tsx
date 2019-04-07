import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { IRouterProps } from 'modules/common/types';
import { Alert, withProps } from 'modules/common/utils';
import { queries as brandQueries } from 'modules/settings/brands/graphql';
import Gmail from 'modules/settings/integrations/components/google/Gmail';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { BrandsQueryResponse } from '../../../brands/types';
import { mutations } from '../../graphql';
import {
  CreateGmailMutationResponse,
  CreateGmailMutationVariables
} from '../../types';

type Props = {
  type?: string;
  closeModal: () => void;
};

type FinalProps = {
  brandsQuery: BrandsQueryResponse;
  queryParams: any;
} & IRouterProps &
  Props &
  CreateGmailMutationResponse;

class GmailContainer extends React.Component<FinalProps> {
  render() {
    const { brandsQuery, saveMutation, closeModal } = this.props;

    if (brandsQuery.loading) {
      return <Spinner objective={true} />;
    }

    const brands = brandsQuery.brands;

    const save = (
      variables: CreateGmailMutationVariables,
      callback: () => void
    ) => {
      saveMutation({ variables })
        .then(() => {
          Alert.success('Congrats');
          callback();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const updatedProps = {
      closeModal,
      brands,
      save
    };

    return <Gmail {...updatedProps} />;
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
    graphql<Props, CreateGmailMutationResponse, CreateGmailMutationVariables>(
      gql(mutations.integrationsCreateGmailIntegration),
      { name: 'saveMutation' }
    )
  )(GmailContainer)
);
