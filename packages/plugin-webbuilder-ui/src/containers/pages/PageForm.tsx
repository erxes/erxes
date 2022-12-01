import * as compose from 'lodash.flowright';

import {
  IPageDoc,
  PageDetailQueryResponse,
  PagesAddMutationResponse,
  PagesEditMutationResponse,
  PagesMainQueryResponse,
  TypesQueryResponse
} from '../../types';
import { mutations, queries } from '../../graphql';

import { Alert } from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import PageForm from '../../components/pages/PageForm';
import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';

type Props = {
  _id?: string;
} & IRouterProps;

type FinalProps = Props & {
  pageDetailQuery?: PageDetailQueryResponse;
} & PagesAddMutationResponse &
  PagesEditMutationResponse;

const FormContainer = (props: FinalProps) => {
  const { pageDetailQuery, history } = props;

  if (!pageDetailQuery || (pageDetailQuery && pageDetailQuery.loading)) {
    return null;
  }

  const save = (
    name: string,
    description: string,
    siteId: string,
    html: string,
    css: string
  ) => {
    let method: any = props.pagesAdd;

    const variables: any = {
      name,
      description,
      siteId,
      html,
      css
    };

    if (props._id) {
      method = props.pagesEdit;
      variables._id = props._id;
    }

    method({ variables })
      .then(() => {
        Alert.success(`Success`);

        history.push({
          pathname: '/webbuilder/pages'
        });
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const updatedProps = {
    ...props,
    save,
    page: pageDetailQuery.webbuilderPageDetail || ({} as IPageDoc)
  };

  return <PageForm {...updatedProps} />;
};

const refetchPageQueries = () => [{ query: gql(queries.pagesMain) }];

export default compose(
  graphql<{}, PagesAddMutationResponse>(gql(mutations.add), {
    name: 'pagesAdd',
    options: () => ({
      refetchQueries: refetchPageQueries()
    })
  }),

  graphql<Props, PagesEditMutationResponse>(gql(mutations.edit), {
    name: 'pagesEdit',
    options: ({ _id }) => ({
      refetchQueries: [
        ...refetchPageQueries(),
        { query: gql(queries.pageDetail), variables: { _id } }
      ]
    })
  }),

  graphql<Props, PageDetailQueryResponse, { _id?: string }>(
    gql(queries.pageDetail),
    {
      name: 'pageDetailQuery',
      skip: ({ _id }) => !_id,
      options: ({ _id }) => ({
        variables: { _id }
      })
    }
  )
)(withRouter(FormContainer));
