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
    props
      .pagesAdd({
        variables: {
          name,
          description,
          html,
          css,
          jsonData
        }
      })
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

  graphql(gql(queries.pageDetail), {
    name: 'pageDetailQuery',
    skip: (props: Props) => !props._id,
    options: (props: Props) => ({
      variables: { _id: props._id }
    })
  })
)(FormContainer);
