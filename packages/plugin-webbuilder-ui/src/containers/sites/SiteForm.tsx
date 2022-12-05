import * as compose from 'lodash.flowright';

import {
  PageDetailQueryResponse,
  PagesAddMutationResponse,
  PagesEditMutationResponse,
  PagesMainQueryResponse,
  TypesQueryResponse
} from '../../types';
import { mutations, queries } from '../../graphql';

import { Alert } from '@erxes/ui/src';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import SiteForm from '../../components/sites/SiteForm';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { withRouter } from 'react-router-dom';

type Props = {
  _id?: string;
  queryParams: any;
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
    pages: pagesMain.list.reverse() || []
  };

  return <SiteForm {...updatedProps} />;
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
    options: ({ queryParams }) => ({
      refetchQueries: [
        ...refetchPageQueries(),
        {
          query: gql(queries.pageDetail),
          variables: { _id: queryParams.pageId || '' }
        }
      ]
    })
  }),

  graphql<Props, PageDetailQueryResponse, { _id?: string }>(
    gql(queries.pageDetail),
    {
      name: 'pageDetailQuery',
      skip: ({ queryParams }) => !queryParams.pageId,
      options: ({ queryParams }) => ({
        variables: { _id: queryParams.pageId || '' }
      })
    }
  ),
  graphql<{}, TypesQueryResponse>(gql(queries.contentTypes), {
    name: 'typesQuery'
  }),
  graphql<Props, PagesMainQueryResponse>(gql(queries.pagesMain), {
    name: 'pagesMainQuery',
    options: ({ _id, queryParams }) => ({
      variables: {
        ...generatePaginationParams(queryParams),
        siteId: _id || ''
      }
    })
  })
)(withRouter(FormContainer));
