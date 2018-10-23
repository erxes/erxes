import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import { IIntegration } from 'modules/settings/integrations/types';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { save } from '../../integrations/containers/utils';
import { ChooseBrand } from '../components';
import { mutations, queries } from '../graphql';

type Variables = {
  name: string;
  brandId: string;
};

type Props = {
  integration: IIntegration;
  brandsQuery: any;

  addMutation: (params: { variables: Variables }) => Promise<any>;
  editMutation: (params: { variables: Variables }) => Promise<any>;
  onSave: () => void;
  refetch: () => void;
};

const ChooseBrandContainer = (props: Props) => {
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

export default compose(
  graphql(gql(queries.brands), {
    name: 'brandsQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  }),

  graphql(gql(mutations.integrationsCreateMessenger), {
    name: 'addMutation'
  }),

  graphql(gql(mutations.integrationsEditMessenger), {
    name: 'editMutation'
  })
)(ChooseBrandContainer);
