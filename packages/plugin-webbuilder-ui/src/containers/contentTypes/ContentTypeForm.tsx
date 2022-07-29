import React from 'react';
import { graphql } from 'react-apollo';
import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import { mutations, queries } from '../../graphql';
import { Alert } from '@erxes/ui/src/utils';
import { IRouterProps } from '@erxes/ui/src/types';
import { withRouter } from 'react-router-dom';
import {
  TypeDetailQueryResponse,
  TypesAddMutationResponse,
  TypesEditMutationResponse
} from '../../types';
import Spinner from '@erxes/ui/src/components/Spinner';
import ContentTypeForm from '../../components/contentTypes/ContenTypeForm';

type Props = {
  contentTypeId?: string;
  contentTypeDetailQuery: TypeDetailQueryResponse;
} & IRouterProps;

type FinalProps = {
  contentTypeDetailQuery: TypeDetailQueryResponse;
} & Props &
  TypesAddMutationResponse &
  TypesEditMutationResponse;

function ContentTypeFormContainer(props: FinalProps) {
  const {
    typesAddMutation,
    typesEditMutation,
    history,
    contentTypeId,
    contentTypeDetailQuery
  } = props;

  if (contentTypeDetailQuery && contentTypeDetailQuery.loading) {
    return <Spinner objective={true} />;
  }

  const contentType =
    (contentTypeDetailQuery &&
      contentTypeDetailQuery.webbuilderContentTypeDetail) ||
    {};

  const action = (variables: any) => {
    let method: any = typesAddMutation;

    if (contentTypeId) {
      method = typesEditMutation;

      variables._id = contentTypeId;
    }

    method({ variables })
      .then(() => {
        Alert.success('Success');

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

  return <ContentTypeForm {...updatedProps} />;
}

const refetchTypeQueries = () => [
  { query: gql(queries.contentTypes) },
  { query: gql(queries.contentTypesTotalCount) }
];

export default compose(
  graphql<{}, TypesAddMutationResponse>(gql(mutations.typesAdd), {
    name: 'typesAddMutation',
    options: () => ({
      refetchQueries: refetchTypeQueries()
    })
  }),
  graphql<{}, TypesEditMutationResponse>(gql(mutations.typesEdit), {
    name: 'typesEditMutation',
    options: () => ({
      refetchQueries: refetchTypeQueries()
    })
  }),
  graphql<Props, TypeDetailQueryResponse>(gql(queries.contentTypeDetail), {
    name: 'contentTypeDetailQuery',
    skip: ({ contentTypeId }) => !contentTypeId,
    options: ({ contentTypeId }) => ({
      variables: {
        _id: contentTypeId
      }
    })
  })
)(withRouter(ContentTypeFormContainer));
