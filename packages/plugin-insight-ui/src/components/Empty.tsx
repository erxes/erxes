import React from 'react';

import PageContent from '@erxes/ui/src/layout/components/PageContent';
import EmptyState from '@erxes/ui/src/components/EmptyState';

import { ContentContainer } from '../styles';
import { Spinner } from '@erxes/ui/src';

type Props = {
  queryParams: any;
  loading: boolean;
};

const Empty = ({ loading }: Props) => {
  if (loading) {
    return <Spinner />;
  }

  return (
    <ContentContainer>
      <PageContent transparent={false}>
        <EmptyState
          text={
            "In the sidebar, you can select from existing items or create a new one if what you're looking for isn't already listed."
          }
          image={'/images/actions/27.svg'}
        />
      </PageContent>
    </ContentContainer>
  );
};

export default Empty;
