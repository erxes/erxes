import { Alert } from '@erxes/ui/src';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import * as compose from 'lodash.flowright';
import EntryForm from '../../components/entries/EntryForm';
import React from 'react';
import { mutations, queries } from '../../graphql';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';
import {
  EntriesAddMutationResponse,
  EntriesEditMutationResponse,
  EntryDetailQueryResponse,
  TypeDetailQueryResponse
} from '../../types';

type Props = {
  _id?: string;
  contentTypeId: string;
  queryParams: any;
} & IRouterProps;

type FinalProps = Props & {
  entryDetailQuery?: EntryDetailQueryResponse;
  contentTypeDetailQuery: TypeDetailQueryResponse;
} & EntriesAddMutationResponse &
  EntriesEditMutationResponse;

const FormContainer = (props: FinalProps) => {
  const { contentTypeDetailQuery, entryDetailQuery, history } = props;

  if (
    (entryDetailQuery && entryDetailQuery.loading) ||
    contentTypeDetailQuery.loading
  ) {
    return null;
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

        history.push({
          pathname: `/webbuilder/pages`
        });
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
    contentType
  };

  return <EntryForm {...updatedProps} />;
};

export default compose(
  graphql<Props, EntriesAddMutationResponse>(gql(mutations.entriesAdd), {
    name: 'entriesAddMutation',
    options: ({ contentTypeId }) => ({
      refetchQueries: [
        { query: gql(queries.entries), variables: { contentTypeId } }
      ]
    })
  }),

  graphql<Props, EntriesEditMutationResponse>(gql(mutations.entriesEdit), {
    name: 'entriesEditMutation',
    options: ({ contentTypeId }) => ({
      refetchQueries: [
        { query: gql(queries.entries), variables: { contentTypeId } }
      ]
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
