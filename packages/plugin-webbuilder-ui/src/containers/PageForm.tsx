import { Alert } from '@erxes/ui/src';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import * as compose from 'lodash.flowright';
import PageForm from '../components/PageForm';
import React from 'react';
import { mutations, queries } from '../graphql';

type Props = {
  _id?: string;
};

type FinalProps = Props & {
  pagesAdd: any;
  pagesEdit: any;
  pageDetailQuery?: any;
};

const FormContainer = (props: FinalProps) => {
  const { pageDetailQuery } = props;

  if (pageDetailQuery && pageDetailQuery.loading) {
    return null;
  }

  const save = (
    name: string,
    description: string,
    html: string,
    css: string,
    jsonData
  ) => {
    let method = props.pagesAdd;

    const variables: any = {
      name,
      description,
      html,
      css,
      jsonData
    };

    if (props._id) {
      method = props.pagesEdit;
      variables._id = props._id;
    }

    method({ variables })
      .then(() => {
        Alert.success(`Success`);
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  let page;

  if (pageDetailQuery) {
    page = pageDetailQuery.webbuilderPageDetail;
  }

  return <PageForm save={save} page={page} />;
};

export default compose(
  graphql<Props>(gql(mutations.add), {
    name: 'pagesAdd'
  }),

  graphql<Props>(gql(mutations.edit), {
    name: 'pagesEdit'
  }),

  graphql(gql(queries.pageDetail), {
    name: 'pageDetailQuery',
    skip: (props: Props) => !props._id,
    options: (props: Props) => ({
      variables: { _id: props._id }
    })
  })
)(FormContainer);
