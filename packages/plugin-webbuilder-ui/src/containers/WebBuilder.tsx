import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import React from 'react';
import * as compose from 'lodash.flowright';
import { queries } from '../graphql';
import WebBuilder from '../components/WebBuilder';

type Props = {
  step: string;
  queryParams: any;
  history: any;
};

type FinalProps = {
  contentTypesQuery: any;
} & Props;

function WebBuilderContainer(props: FinalProps) {
  const { contentTypesQuery } = props;

  if (contentTypesQuery.loading) {
    return null;
  }

  const contentTypes = contentTypesQuery.webbuilderContentTypes || [];

  const updatedProps = {
    ...props,
    contentTypes
  };

  return <WebBuilder {...updatedProps} />;
}

export default compose(
  graphql(gql(queries.contentTypes), {
    name: 'contentTypesQuery'
  })
)(WebBuilderContainer);
