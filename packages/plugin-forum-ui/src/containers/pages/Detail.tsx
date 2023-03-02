import React from 'react';
import gql from 'graphql-tag';
import { queries } from '../../graphql';
import { PageDetailQueryResponse, IPage } from '../../types';
import EmptyState from '@erxes/ui/src/components/EmptyState';
import Spinner from '@erxes/ui/src/components/Spinner';
import Detail from '../../components/pages/PageDetail';
import { withProps } from '@erxes/ui/src/utils';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';

type Props = {
  id: string;
};

type FinalProps = {
  pageDetailQuery: PageDetailQueryResponse;
} & Props;

function PageDetail(props: FinalProps) {
  const { pageDetailQuery } = props;

  if (pageDetailQuery.loading) {
    return <Spinner objective={true} />;
  }

  if (!pageDetailQuery.forumPage) {
    return <EmptyState text="Page not found" image="/images/actions/17.svg" />;
  }

  const updatedProps = {
    ...props,
    page: pageDetailQuery.forumPage || ({} as IPage)
  };

  return <Detail {...updatedProps} />;
}

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.pageDetail), {
      name: 'pageDetailQuery',
      options: ({ id }) => ({
        variables: {
          id
        },
        fetchPolicy: 'network-only'
      })
    })
  )(PageDetail)
);
