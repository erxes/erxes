import gql from 'graphql-tag';
import { Spinner } from 'modules/common/components';
import * as React from 'react';
import { ChildProps, compose, graphql } from 'react-apollo';
import { withRouter } from 'react-router';
import { save } from '../../integrations/containers/utils';
import { ChooseBrand } from '../components';
import { mutations, queries } from '../graphql';
import { IBrand, IIntegration} from '../types';

type Props = {
  history: any,
  integration: IIntegration,
  addMutation: () => void,
  editMutation: () => void,
  onSave: () => void,
  refetch: () => void,
};

type QueryResponse = {
  brandsQuery: IBrand,
};

const ChooseBrandContainer = (props: ChildProps<Props, QueryResponse>) => {
  const {
    history,
    data,
    integration,
    addMutation,
    editMutation,
    onSave,
    refetch
  } = props;

  if (data.loading) {
    return <Spinner objective />;
  }

  const updatedProps = {
    ...props,

    save: variables =>
      save({
        history,
        variables,
        addMutation,
        editMutation,
        integration,
        onSave,
        refetch
      }),

    brands: data.brandsQuery.brands || []
  };

  return <ChooseBrand {...updatedProps} />;
};

export default withRouter(
  compose(
    graphql<Props, QueryResponse>(
      gql(queries.brands), {
        name: 'brandsQuery',
        options: () => ({
          fetchPolicy: 'network-only'
        })
    }),

    graphql<Props, QueryResponse>(
      gql(mutations.integrationsCreateMessenger), {
        name: 'addMutation'
    }),

    graphql<Props, QueryResponse>(
      gql(mutations.integrationsEditMessenger), {
        name: 'editMutation'
    })
  )(ChooseBrandContainer)
);
