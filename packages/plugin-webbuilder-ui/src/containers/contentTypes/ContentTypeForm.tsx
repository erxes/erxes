import * as compose from 'lodash.flowright';

import { Alert, confirm } from '@erxes/ui/src/utils';
import {
  IContentType,
  TypesAddMutationResponse,
  TypesEditMutationResponse,
  TypesRemoveMutationResponse
} from '../../types';
import { mutations, queries } from '../../graphql';

import ContentTypeForm from '../../components/contentTypes/ContenTypeForm';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { withRouter } from 'react-router-dom';

type Props = {
  onCancel: (settingsObject: any, type: string) => void;
  siteId: string;
  contentType?: IContentType;
} & IRouterProps;

type FinalProps = {} & Props &
  TypesAddMutationResponse &
  TypesEditMutationResponse &
  TypesRemoveMutationResponse;

function ContentTypeFormContainer(props: FinalProps) {
  const {
    typesAddMutation,
    typesEditMutation,
    typesRemoveMutation,
    contentType
  } = props;

  const action = (variables: any, afterSave?: any) => {
    let method: any = typesAddMutation;

    if (contentType && contentType._id) {
      method = typesEditMutation;

      variables._id = contentType._id;
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
    contentType: contentType || ({} as IContentType)
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
    options: ({ contentType, siteId }) => ({
      refetchQueries: [
        ...refetchTypeQueries(siteId),
        {
          query: gql(queries.contentTypeDetail),
          variables: {
            _id: contentType && contentType._id ? contentType._id : ''
          }
        }
      ]
    })
  }),
  graphql<Props, TypesRemoveMutationResponse>(gql(mutations.typesRemove), {
    name: 'typesRemoveMutation',
    options: ({ siteId }) => ({
      refetchQueries: refetchTypeQueries(siteId)
    })
  })
)(withRouter(ContentTypeFormContainer));
