import gql from 'graphql-tag';
import Spinner from '@erxes/ui/src/components/Spinner';
import { graphql } from 'react-apollo';
import * as compose from 'lodash.flowright';
import Pages from '../../components/pages/Pages';
import { queries, mutations } from '../../graphql';
import React from 'react';
import { Alert, confirm } from '@erxes/ui/src/utils';
import {
  PagesMainQueryResponse,
  PagesRemoveMutationResponse
} from '../../types';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';

type Props = {
  getActionBar: (actionBar: any) => void;
  setCount: (count: number) => void;
  queryParams: any;
  history: any;
  selectedSite: string;
};

type FinalProps = {
  pagesMainQuery: PagesMainQueryResponse;
} & Props &
  PagesRemoveMutationResponse;

class PagesContainer extends React.Component<FinalProps> {
  render() {
    const { pagesMainQuery, pagesRemoveMutation, queryParams } = this.props;

    if (pagesMainQuery.loading) {
      return <Spinner objective={true} />;
    }

    const { list = [], totalCount = 0 } =
      pagesMainQuery.webbuilderPagesMain || {};

    const searchValue = queryParams.searchValue || '';

    const remove = (_id: string) => {
      confirm().then(() => {
        pagesRemoveMutation({ variables: { _id } })
          .then(() => {
            Alert.success('You successfully deleted a page.');

            pagesMainQuery.refetch();
          })
          .catch(e => {
            Alert.error(e.message);
          });
      });
    };

    const updatedProps = {
      ...this.props,
      pages: list,
      pagesCount: totalCount,
      remove,
      searchValue
    };

    return <Pages {...updatedProps} />;
  }
}

export default compose(
  graphql<Props, PagesMainQueryResponse>(gql(queries.pagesMain), {
    name: 'pagesMainQuery',
    options: ({ queryParams, selectedSite }) => ({
      variables: {
        ...generatePaginationParams(queryParams),
        searchValue: queryParams.searchValue,
        siteId: queryParams.siteId || selectedSite
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql<{}, PagesRemoveMutationResponse>(gql(mutations.remove), {
    name: 'pagesRemoveMutation'
  })
)(PagesContainer);
