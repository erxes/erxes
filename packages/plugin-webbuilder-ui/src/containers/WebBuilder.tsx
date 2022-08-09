import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import React from 'react';
import * as compose from 'lodash.flowright';
import { queries } from '../graphql';
import WebBuilder from '../components/WebBuilder';
import { withRouter } from 'react-router-dom';
import { TypesQueryResponse } from '../types';
import { IRouterProps } from '@erxes/ui/src/types';

type Props = {
  step: string;
  queryParams: any;
} & IRouterProps;

type FinalProps = {
  contentTypesQuery: TypesQueryResponse;
} & Props;

function WebBuilderContainer(props: FinalProps) {
  const { contentTypesQuery } = props;

  const contentTypes = contentTypesQuery.webbuilderContentTypes || [];

  const updatedProps = {
    ...props,
    contentTypes,
    loading: contentTypesQuery.loading
  };

  return <WebBuilder {...updatedProps} />;
}

export default compose(
  graphql<{}, TypesQueryResponse>(gql(queries.contentTypes), {
    name: 'contentTypesQuery'
  })
)(withRouter(WebBuilderContainer));
