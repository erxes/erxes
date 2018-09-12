import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { save } from '../../integrations/containers/utils';
import { ChooseBrand } from '../components';
import { mutations, queries } from '../graphql';
import { IIntegration} from '../types';

type Props = {
  integration?: IIntegration,
  brandsQuery: any,
  addMutation: () => void,
  editMutation: () => void,
  onSave: () => void,
  refetch: () => void,
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
    return <Spinner objective />;
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
  graphql<Props>(
    gql(queries.brands), {
      name: 'brandsQuery',
      options: () => ({
        fetchPolicy: 'network-only'
      })
  }),

  graphql<Props>(
    gql(mutations.integrationsCreateMessenger), {
      name: 'addMutation'
  }),

  graphql<Props>(
    gql(mutations.integrationsEditMessenger), {
      name: 'editMutation'
  })
)(ChooseBrandContainer);