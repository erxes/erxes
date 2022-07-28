import gql from 'graphql-tag';
import Spinner from '@erxes/ui/src/components/Spinner';
import { graphql } from 'react-apollo';
import * as compose from 'lodash.flowright';
import Pages from '../../components/pages/Pages';
import { queries, mutations } from '../../graphql';
import React from 'react';
import { Alert, confirm } from '@erxes/ui/src/utils';
import { PagesQueryResponse, PagesRemoveMutationResponse } from '../../types';

type Props = {
  getActionBar: (actionBar: any) => void;
};

type FinalProps = {
  pagesQuery: PagesQueryResponse;
} & Props &
  PagesRemoveMutationResponse;

class PagesContainer extends React.Component<FinalProps> {
  render() {
    const { pagesQuery, pagesRemoveMutation } = this.props;

    if (pagesQuery.loading) {
      return <Spinner objective={true} />;
    }

    const pages = pagesQuery.webbuilderPages || [];

    const remove = (_id: string) => {
      confirm().then(() => {
        pagesRemoveMutation({ variables: { _id } })
          .then(() => {
            Alert.success('You successfully deleted a page.');

            pagesQuery.refetch();
          })
          .catch(e => {
            Alert.error(e.message);
          });
      });
    };

    const updatedProps = {
      ...this.props,
      pages,
      remove
    };

    return <Pages {...updatedProps} />;
  }
}

export default compose(
  graphql<{}, PagesQueryResponse>(gql(queries.pages), {
    name: 'pagesQuery'
  }),
  graphql<{}, PagesRemoveMutationResponse>(gql(mutations.remove), {
    name: 'pagesRemoveMutation'
  })
)(PagesContainer);
