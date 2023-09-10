import * as compose from 'lodash.flowright';

import { Alert, confirm } from '@erxes/ui/src/utils';
import {
  IPageDoc,
  PageDetailQueryResponse,
  PagesAddMutationResponse,
  PagesEditMutationResponse,
  PagesRemoveMutationResponse,
  TypesQueryResponse
} from '../../types';
import { mutations, queries } from '../../graphql';

import Detail from '../../components/sites/Detail';
import { IRouterProps } from '@erxes/ui/src/types';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { withRouter } from 'react-router-dom';

type Props = {
  _id: string;
  queryParams: any;
  onLoad: (isLoading?: boolean) => void;
  pages: IPageDoc[];
  loading: boolean;
  settingsObject: any;
  type: string;
  showDarkMode: boolean;
  handleItemSettings: (item: any, type: string) => void;
} & IRouterProps;

type FinalProps = Props & {
  pageDetailQuery?: PageDetailQueryResponse;
  typesQuery: TypesQueryResponse;
} & PagesAddMutationResponse &
  PagesEditMutationResponse &
  PagesRemoveMutationResponse;

const SitesDetailContainer = (props: FinalProps) => {
  const { pageDetailQuery, typesQuery } = props;

  if ((pageDetailQuery && pageDetailQuery.loading) || typesQuery.loading) {
    return <Spinner />;
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

  const contentTypes = typesQuery.webbuilderContentTypes || [];

  const updatedProps = {
    ...props,
    contentTypes,
    page,
    pageSave,
    pageRemove
  };

  return <Detail {...updatedProps} />;
};

const refetchPageQueries = ({ _id, queryParams }) => [
  {
    query: gql(queries.pagesMain),
    variables: {
      ...generatePaginationParams(queryParams),
      siteId: _id || ''
    }
  }
];

export default compose(
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
  graphql<Props, PagesAddMutationResponse>(gql(mutations.add), {
    name: 'pagesAdd',
    options: ({ _id, queryParams }) => ({
      refetchQueries: refetchPageQueries({ _id, queryParams })
    })
  }),
  graphql<Props, PagesEditMutationResponse>(gql(mutations.edit), {
    name: 'pagesEdit',
    options: ({ queryParams, _id }) => ({
      refetchQueries: [
        ...refetchPageQueries({ _id, queryParams }),
        {
          query: gql(queries.pageDetail),
          variables: { _id: queryParams.pageId || '' }
        }
      ]
    })
  }),
  graphql<Props, PagesRemoveMutationResponse>(gql(mutations.remove), {
    name: 'pagesRemoveMutation',
    options: ({ _id, queryParams }) => ({
      refetchQueries: refetchPageQueries({ _id, queryParams })
    })
  }),
  graphql<{}, TypesQueryResponse>(gql(queries.contentTypes), {
    name: 'typesQuery'
  })
)(withRouter(SitesDetailContainer));
