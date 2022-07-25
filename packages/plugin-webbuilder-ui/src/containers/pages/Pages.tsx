import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import * as compose from 'lodash.flowright';
import Pages from '../../components/pages/Pages';
import { queries, mutations } from '../../graphql';
import React from 'react';
import { Alert, confirm } from '@erxes/ui/src/utils';

type Props = {
  getActionBar: (actionBar: any) => void;
};

type FinalProps = {
  pagesQuery: any;
  pagesRemoveMutation: any;
} & Props;

class PagesContainer extends React.Component<FinalProps> {
  render() {
    const { pagesQuery, pagesRemoveMutation } = this.props;

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
  graphql(gql(queries.pages), {
    name: 'pagesQuery'
  }),
  graphql(gql(mutations.remove), {
    name: 'pagesRemoveMutation'
  })
)(PagesContainer);
