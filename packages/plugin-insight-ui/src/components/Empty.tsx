import React from 'react';

import PageContent from '@erxes/ui/src/layout/components/PageContent';
import EmptyState from '@erxes/ui/src/components/EmptyState';

import { ContentContainer } from '../styles';

type Props = {
  queryParams: any;
  history: any;
};

const Empty = (props: Props) => {
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
