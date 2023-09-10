import React from 'react';
import Sidebar from '../components/Sidebar';
import * as compose from 'lodash.flowright';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '../graphql';
import { TypesQueryResponse } from '../types';

type Props = {
  queryParams: any;
  type: string;
  selectedSite: string;
};

type FinalProps = {
  contentTypesQuery: TypesQueryResponse;
} & Props;

function SidebarContainer(props: FinalProps) {
  const { contentTypesQuery } = props;

  if (contentTypesQuery.loading) {
    return null;
  }

  const contentTypes = contentTypesQuery.webbuilderContentTypes || [];

  const updatedProps = {
    ...props,
    contentTypes
  };

  return <Sidebar {...updatedProps} />;
}

export default compose(
  graphql<Props>(gql(queries.contentTypes), {
    name: 'contentTypesQuery',
    options: ({ selectedSite }) => ({
      variables: {
        siteId: selectedSite
      }
    })
  })
)(SidebarContainer);
