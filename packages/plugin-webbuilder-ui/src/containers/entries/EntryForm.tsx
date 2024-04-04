import * as compose from 'lodash.flowright';

import {
  EntriesAddMutationResponse,
  EntriesEditMutationResponse,
  EntryDetailQueryResponse,
  TypeDetailQueryResponse
} from '../../types';
import { mutations, queries } from '../../graphql';

import { Alert } from '@erxes/ui/src';
import EntryForm from '../../components/entries/EntryForm';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { withRouter } from 'react-router-dom';

type Props = {
  _id?: string;
  contentTypeId: string;
  queryParams: any;
  closeModal: () => void;
} & IRouterProps;

type FinalProps = Props & {
  entryDetailQuery?: EntryDetailQueryResponse;
  contentTypeDetailQuery: TypeDetailQueryResponse;
} & EntriesAddMutationResponse &
  EntriesEditMutationResponse;

const FormContainer = (props: FinalProps) => {
  const { contentTypeDetailQuery, entryDetailQuery, closeModal } = props;

  if (
    (entryDetailQuery && entryDetailQuery.loading) ||
    contentTypeDetailQuery.loading
  ) {
    return <Spinner objective={true} />;
  }

  const save = (contentTypeId: string, values: any) => {
    let method: any = props.entriesAddMutation;

    const variables: any = {
      contentTypeId,
      values
    };

    if (props._id) {
      method = props.entriesEditMutation;
      variables._id = props._id;
    }

    method({ variables })
      .then(() => {
        Alert.success(`Success`);

        closeModal();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const contentType = contentTypeDetailQuery.webbuilderContentTypeDetail || {};
  let entry;

  if (entryDetailQuery) {
    entry = entryDetailQuery.webbuilderEntryDetail;
  }

  const updatedProps = {
    save,
    entry,
    closeModal,
    contentType
  };

  return <EntryForm {...updatedProps} />;
};

const refetchEntryQueries = (contentTypeId: string) => [
  { query: gql(queries.entriesMain), variables: { contentTypeId } }
];

export default compose(
  graphql<Props, EntriesAddMutationResponse>(gql(mutations.entriesAdd), {
    name: 'entriesAddMutation',
    options: ({ contentTypeId }) => ({
      refetchQueries: refetchEntryQueries(contentTypeId)
    })
  }),

  graphql<Props, EntriesEditMutationResponse>(gql(mutations.entriesEdit), {
    name: 'entriesEditMutation',
    options: ({ contentTypeId }) => ({
      refetchQueries: refetchEntryQueries(contentTypeId)
    })
  }),

  graphql<Props, EntryDetailQueryResponse>(gql(queries.entryDetail), {
    name: 'entryDetailQuery',
    skip: ({ _id }) => !_id,
    options: ({ _id }) => ({
      variables: { _id }
    })
  }),

  graphql<Props, TypeDetailQueryResponse>(gql(queries.contentTypeDetail), {
    name: 'contentTypeDetailQuery',
    options: ({ contentTypeId }) => ({
      variables: {
        _id: contentTypeId || ''
      }
    })
  })
)(withRouter(FormContainer));
