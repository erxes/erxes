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
  siteId: string;
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
    typesAddMutation,
    typesEditMutation,
    typesRemoveMutation,
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

  const action = (variables: any, afterSave?: any) => {
    let method: any = typesAddMutation;

    if (contentTypeId) {
      method = typesEditMutation;

      variables._id = contentTypeId;
    }

    method({ variables })
      .then(() => {
        Alert.success('Success');

        if (afterSave) {
          afterSave();
        }
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
    ...props,
    action,
    remove,
    contentType
  };

  return <ContentTypeForm {...updatedProps} />;
}

const refetchTypeQueries = (siteId: string) => [
  { query: gql(queries.contentTypesMain), variables: { siteId } },
  {
    query: gql(queries.contentTypes),
    variables: { siteId }
  }
];

export default compose(
  graphql<Props, TypesAddMutationResponse>(gql(mutations.typesAdd), {
    name: 'typesAddMutation',
    options: ({ siteId }) => ({
      refetchQueries: refetchTypeQueries(siteId)
    })
  }),
  graphql<Props, TypesEditMutationResponse>(gql(mutations.typesEdit), {
    name: 'typesEditMutation',
    options: ({ contentTypeId, siteId }) => ({
      refetchQueries: [
        ...refetchTypeQueries(siteId),
        {
          query: gql(queries.contentTypeDetail),
          variables: { _id: contentTypeId }
        }
      ]
    })
  }),
  graphql<Props, TypesRemoveMutationResponse>(gql(mutations.typesRemove), {
    name: 'typesRemoveMutation',
    options: ({ siteId }) => ({
      refetchQueries: refetchTypeQueries(siteId)
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
