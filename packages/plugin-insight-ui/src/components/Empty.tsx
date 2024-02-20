import React from 'react';
import { ContentContainer } from '../styles';
import { EmptyState, PageContent } from '@erxes/ui/src';

const Empty = () => {
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
