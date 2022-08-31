import { Alert } from '@erxes/ui/src';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import * as compose from 'lodash.flowright';
import PageForm from '../../components/pages/PageForm';
import React from 'react';
import { mutations, queries } from '../../graphql';
import { withRouter } from 'react-router-dom';
import { IRouterProps } from '@erxes/ui/src/types';
import {
  PageDetailQueryResponse,
  PagesAddMutationResponse,
  PagesEditMutationResponse,
  PagesMainQueryResponse,
  TypesQueryResponse
} from '../../types';

type Props = {
  _id?: string;
} & IRouterProps;

type FinalProps = Props & {
  pageDetailQuery?: PageDetailQueryResponse;
  pagesMainQuery: PagesMainQueryResponse;
  typesQuery: TypesQueryResponse;
} & PagesAddMutationResponse &
  PagesEditMutationResponse;

const FormContainer = (props: FinalProps) => {
  const { pageDetailQuery, history, pagesMainQuery, typesQuery } = props;

  if (
    (pageDetailQuery && pageDetailQuery.loading) ||
    pagesMainQuery.loading ||
    typesQuery.loading
  ) {
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

  let page;

  if (pageDetailQuery) {
    page = pageDetailQuery.webbuilderPageDetail;
  }

  const pagesMain = pagesMainQuery.webbuilderPagesMain || {};
  const contentTypes = typesQuery.webbuilderContentTypes || [];

  const updatedProps = {
    ...props,
    save,
    page,
    contentTypes,
    pages: pagesMain.list || []
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
  ),
  graphql<{}, TypesQueryResponse>(gql(queries.contentTypes), {
    name: 'typesQuery'
  }),
  graphql<{}, PagesMainQueryResponse>(gql(queries.pagesMain), {
    name: 'pagesMainQuery'
  })
)(withRouter(FormContainer));
