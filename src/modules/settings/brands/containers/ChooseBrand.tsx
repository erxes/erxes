import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { __, Alert, withProps } from 'modules/common/utils';
import {
  AddIntegrationMutationResponse,
  EditIntegrationMutationResponse,
  IIntegration
} from 'modules/settings/integrations/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { ChooseBrand } from '../components';
import { mutations, queries } from '../graphql';
import { BrandsQueryResponse, IChooseBrand } from '../types';

type Variables = {
  name: string;
  brandId: string;
};

type Props = {
  integration: IIntegration;
  onSave: () => void;
  refetch: () => void;
};

type FinalProps = {
  brandsQuery: BrandsQueryResponse;

  addMutation: (params: { variables: Variables }) => Promise<any>;
  editMutation: (params: { variables: Variables }) => Promise<any>;
} & Props;

const ChooseBrandContainer = (props: FinalProps) => {
  const {
    brandsQuery,
    integration,
    addMutation,
    editMutation,
    onSave,
    refetch
  } = props;

  if (brandsQuery.loading) {
    return <Spinner objective={true} />;
  }

  const save = (variables: IChooseBrand) => {
    let mutation = addMutation;

    if (integration && integration._id) {
      mutation = editMutation;
      variables._id = integration._id;
    }

    mutation({
      variables
    })
      .then(() => {
        if (refetch) {
          refetch();
        }

        if (onSave) {
          onSave();
        }

        Alert.success('You successfully chose a new brand');
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    save,
    brands: brandsQuery.brands || []
  };

  return <ChooseBrand {...updatedProps} />;
};

export default withProps<Props>(
  compose(
    graphql<Props, BrandsQueryResponse, {}>(gql(queries.brands), {
      name: 'brandsQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
    }),
    graphql<Props, AddIntegrationMutationResponse, IIntegration>(
      gql(mutations.integrationsCreateMessenger),
      {
        name: 'addMutation'
      }
    ),
    graphql<Props, EditIntegrationMutationResponse, IIntegration>(
      gql(mutations.integrationsEditMessenger),
      {
        name: 'editMutation'
      }
    )
  )(ChooseBrandContainer)
);
