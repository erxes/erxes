import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';
import * as compose from 'lodash.flowright';
import { mutations, queries } from '../../graphql';
import { Alert } from '@erxes/ui/src/utils';
import { IRouterProps } from '@erxes/ui/src/types';
import ContentType from '../../components/contentTypes/ContenType';
import {
  TypeDetailQueryResponse,
  TypesEditMutationResponse
} from '../../types';

type Props = {
  contentTypeId: string;
  queryParams: any;
} & IRouterProps;

type FinalProps = {
  contentTypeDetailQuery: TypeDetailQueryResponse;
} & Props &
  TypesEditMutationResponse;

function EditContentTypeContainer(props: FinalProps) {
  const { typesEditMutation, contentTypeDetailQuery, history } = props;

  if (contentTypeDetailQuery.loading) {
    return null;
  }

  const contentType = contentTypeDetailQuery.webbuilderContentTypeDetail || {};

  const action = (doc: any) => {
    typesEditMutation({ variables: doc })
      .then(() => {
        Alert.success('Successfully edited a type');

        history.push({
          pathname: '/webbuilder/contenttypes'
        });
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    action,
    contentType
  };

  return <ContentType {...updatedProps} />;
}

export default compose(
  graphql<{}, TypesEditMutationResponse>(gql(mutations.typesEdit), {
    name: 'typesEditMutation',
    options: () => ({
      refetchQueries: [
        { query: gql(queries.contentTypes) },
        { query: gql(queries.contentTypesTotalCount) }
      ]
    })
  }),
  graphql<Props, TypeDetailQueryResponse>(gql(queries.contentTypeDetail), {
    name: 'contentTypeDetailQuery',
    options: ({ contentTypeId }) => ({
      variables: {
        _id: contentTypeId
      }
    })
  })
)(withRouter(EditContentTypeContainer));
