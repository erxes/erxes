import React from 'react';
import { graphql } from 'react-apollo';
import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import { mutations, queries } from '../../graphql';
import { Alert } from '@erxes/ui/src/utils';
import ContentType from '../../components/contentTypes/ContenType';
import { IRouterProps } from '@erxes/ui/src/types';
import { withRouter } from 'react-router-dom';
import { TypesAddMutationResponse } from '../../types';

type Props = {} & IRouterProps & TypesAddMutationResponse;

function CreateContentTypeContainer(props: Props) {
  const { typesAddMutation, history } = props;

  const action = (doc: any) => {
    typesAddMutation({ variables: doc })
      .then(() => {
        Alert.success('Content type added');

        history.push({
          pathname: '/webbuilder/contenttypes'
        });
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    action
  };

  return <ContentType {...updatedProps} />;
}

export default compose(
  graphql<{}, TypesAddMutationResponse>(gql(mutations.typesAdd), {
    name: 'typesAddMutation',
    options: () => ({
      refetchQueries: [
        { query: gql(queries.contentTypes) },
        { query: gql(queries.contentTypesTotalCount) }
      ]
    })
  })
)(withRouter(CreateContentTypeContainer));
