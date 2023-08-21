import * as compose from 'lodash.flowright';

import { Alert, confirm } from '@erxes/ui/src/utils';
import {
  PageDetailQueryResponse,
  PagesAddMutationResponse,
  PagesEditMutationResponse,
  PagesMainQueryResponse,
  PagesRemoveMutationResponse,
  TypesQueryResponse
} from '../../types';
import { mutations, queries } from '../../graphql';

import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import SiteForm from '../../components/sites/SiteForm';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { withRouter } from 'react-router-dom';

type Props = {
  _id: string;
  queryParams: any;
} & IRouterProps;

type FinalProps = Props & {
  pageDetailQuery?: PageDetailQueryResponse;
  pagesMainQuery: PagesMainQueryResponse;
  typesQuery: TypesQueryResponse;
} & PagesAddMutationResponse &
  PagesEditMutationResponse &
  PagesRemoveMutationResponse;

const PageDetailContainer = (props: FinalProps) => {
  const { pageDetailQuery, history, pagesMainQuery, typesQuery } = props;

  if (
    (pageDetailQuery && pageDetailQuery.loading) ||
    pagesMainQuery.loading ||
    typesQuery.loading
  ) {
    return null;
  }

  const pageSave = (
    name: string,
    description: string,
    siteId: string,
    html: string,
    css: string,
    pageId?: string,
    afterSave?: any
  ) => {
    let method: any = props.pagesAdd;

    const variables: any = {
      name,
      description,
      siteId,
      html,
      css
    };

    if (pageId) {
      method = props.pagesEdit;
      variables._id = pageId;
    }

    method({ variables })
      .then(() => {
        Alert.success(`Success`);

        if (afterSave) {
          afterSave();
        }

        pagesMainQuery.refetch();
      })
      .catch(error => {
        Alert.error(error.message);
      });
  };

  const pageRemove = (_id: string, afterSave?: any) => {
    confirm().then(() => {
      props
        .pagesRemoveMutation({ variables: { _id } })
        .then(() => {
          Alert.success('You successfully deleted a page.');

          if (afterSave) {
            afterSave();
          }

          pagesMainQuery.refetch();
        })
        .catch(e => {
          Alert.error(e.message);
        });
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
    pageSave,
    pageRemove,
    page,
    contentTypes,
    pages: pagesMain.list || []
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
  graphql<{}, PagesRemoveMutationResponse>(gql(mutations.remove), {
    name: 'pagesRemoveMutation'
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
)(withRouter(PageDetailContainer));
