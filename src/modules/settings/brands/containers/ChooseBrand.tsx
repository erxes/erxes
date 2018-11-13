import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { withProps } from 'modules/common/utils';
import {
  AddIntegrationMutationResponse,
  EditIntegrationMutationResponse,
  IIntegration
} from 'modules/settings/integrations/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { save } from '../../integrations/containers/utils';
import { ChooseBrand } from '../components';
import { mutations, queries } from '../graphql';
import { BrandsQueryResponse } from '../types';

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

  const updatedProps = {
    ...props,

    save: variables =>
      save({
        variables,
        addMutation,
        editMutation,
        integration,
        onSave,
        refetch
      }),

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
