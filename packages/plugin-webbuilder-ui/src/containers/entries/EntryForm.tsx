import { Alert } from '@erxes/ui/src';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import * as compose from 'lodash.flowright';
import EntryForm from '../../components/entries/EntryForm';
import React from 'react';
import { mutations, queries } from '../../graphql';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';

type Props = {
  _id?: string;
  contentTypeId: string;
  queryParams: any;
} & IRouterProps;

type FinalProps = Props & {
  entriesAdd: any;
  entriesEdit: any;
  entryDetailQuery?: any;
  contentTypeDetailQuery: any;
};

const FormContainer = (props: FinalProps) => {
  const { contentTypeDetailQuery, entryDetailQuery, history } = props;

  if (
    (entryDetailQuery && entryDetailQuery.loading) ||
    contentTypeDetailQuery.loading
  ) {
    return null;
  }

  const save = (contentTypeId: string, values: any) => {
    let method = props.entriesAdd;

    const variables: any = {
      contentTypeId,
      values
    };

    if (props._id) {
      method = props.entriesEdit;
      variables._id = props._id;
    }

    method({ variables })
      .then(() => {
        Alert.success(`Success`);

        history.push({
          pathname: `/webbuilder/entries/?contentTypeId=${contentTypeId}`
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
  graphql<Props>(gql(mutations.entriesAdd), {
    name: 'entriesAdd',
    options: () => ({
      refetchQueries: [{ query: gql(queries.entries) }]
    })
  }),

  graphql<Props>(gql(mutations.entriesEdit), {
    name: 'entriesEdit',
    options: () => ({
      refetchQueries: [{ query: gql(queries.entries) }]
    })
  }),

  graphql(gql(queries.entryDetail), {
    name: 'entryDetailQuery',
    skip: (props: Props) => !props._id,
    options: (props: Props) => ({
      variables: { _id: props._id }
    })
  }),

  graphql<FinalProps>(gql(queries.contentTypeDetail), {
    name: 'contentTypeDetailQuery',
    options: ({ contentTypeId }) => ({
      variables: {
        _id: contentTypeId || ''
      }
    })
  })
)(withRouter(FormContainer));
