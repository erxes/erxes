import gql from 'graphql-tag';
import Spinner from '@erxes/ui/src/components/Spinner';
import { graphql } from 'react-apollo';
import * as compose from 'lodash.flowright';
import Pages from '../../components/pages/Pages';
import { queries, mutations } from '../../graphql';
import React from 'react';
import { Alert, confirm } from '@erxes/ui/src/utils';
import {
  PagesQueryResponse,
  PagesRemoveMutationResponse,
  PagesTotalCountQueryResponse
} from '../../types';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';

type Props = {
  getActionBar: (actionBar: any) => void;
  setCount: (count: number) => void;
  queryParams: any;
};

type FinalProps = {
  pagesQuery: PagesQueryResponse;
  pagesTotalCountQuery: PagesTotalCountQueryResponse;
} & Props &
  PagesRemoveMutationResponse;

class PagesContainer extends React.Component<FinalProps> {
  render() {
    const {
      pagesQuery,
      pagesRemoveMutation,
      pagesTotalCountQuery
    } = this.props;

    if (pagesQuery.loading || pagesTotalCountQuery.loading) {
      return <Spinner objective={true} />;
    }

    const pages = pagesQuery.webbuilderPages || [];
    const pagesCount = pagesTotalCountQuery.webbuilderPagesTotalCount || 0;

    const remove = (_id: string) => {
      confirm().then(() => {
        pagesRemoveMutation({ variables: { _id } })
          .then(() => {
            Alert.success('You successfully deleted a page.');

            pagesQuery.refetch();
            pagesTotalCountQuery.refetch();
          })
          .catch(e => {
            Alert.error(e.message);
          });
      });
    };

    const updatedProps = {
      ...this.props,
      pages,
      pagesCount,
      remove
    };

    return <Pages {...updatedProps} />;
  }
}

export default compose(
  graphql<Props, PagesQueryResponse>(gql(queries.pages), {
    name: 'pagesQuery',
    options: ({ queryParams }) => ({
      variables: {
        ...generatePaginationParams(queryParams)
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql<{}, PagesTotalCountQueryResponse>(gql(queries.pagesTotalCount), {
    name: 'pagesTotalCountQuery'
  }),
  graphql<{}, PagesRemoveMutationResponse>(gql(mutations.remove), {
    name: 'pagesRemoveMutation'
  })
)(PagesContainer);
