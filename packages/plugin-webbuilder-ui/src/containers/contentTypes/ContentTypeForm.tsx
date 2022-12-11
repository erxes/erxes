import * as compose from 'lodash.flowright';

import { Alert, confirm } from '@erxes/ui/src/utils';
import {
  TypeDetailQueryResponse,
  TypesAddMutationResponse,
  TypesEditMutationResponse,
  TypesRemoveMutationResponse
} from '../../types';
import { mutations, queries } from '../../graphql';

import ContentTypeForm from '../../components/contentTypes/ContenTypeForm';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';

type Props = {
  onCancel: (settingsObject: any, type: string) => void;
  contentTypeId?: string;
} & IRouterProps;

type FinalProps = {
  contentTypeDetailQuery: TypeDetailQueryResponse;
} & Props &
  TypesAddMutationResponse &
  TypesEditMutationResponse &
  TypesRemoveMutationResponse;

function ContentTypeFormContainer(props: FinalProps) {
  const {
    onCancel,
    typesAddMutation,
    typesEditMutation,
    typesRemoveMutation,
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

  const remove = (_id: string, afterSave?: any) => {
    confirm().then(() => {
      typesRemoveMutation({ variables: { _id } })
        .then(() => {
          Alert.success('Successfully removed a content type');

          if (afterSave) {
            afterSave();
          }
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  const updatedProps = {
    action,
    remove,
    onCancel,
    contentType
  };

  return <ContentTypeForm {...updatedProps} />;
}

const refetchTypeQueries = () => [
  { query: gql(queries.contentTypesMain) },
  {
    query: gql(queries.contentTypes),
    variables: { siteId: localStorage.getItem('webbuilderSiteId') }
  }
];

export default compose(
  graphql<{}, TypesAddMutationResponse>(gql(mutations.typesAdd), {
    name: 'typesAddMutation',
    options: () => ({
      refetchQueries: refetchTypeQueries()
    })
  }),
  graphql<Props, TypesEditMutationResponse>(gql(mutations.typesEdit), {
    name: 'typesEditMutation',
    options: ({ contentTypeId }) => ({
      refetchQueries: [
        ...refetchTypeQueries(),
        {
          query: gql(queries.contentTypeDetail),
          variables: { _id: contentTypeId }
        }
      ]
    })
  }),
  graphql<Props, TypesRemoveMutationResponse>(gql(mutations.typesRemove), {
    name: 'typesRemoveMutation',
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
