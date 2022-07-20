import React from 'react';
import * as compose from 'lodash.flowright';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { queries } from '../../graphql';
import ContentTypesList from '../../components/entries/ContentTypesList';

type Props = {
  contentTypesQuery: any;
  queryParams: any;
  history: any;
};

function ContentTypesListContainer(props: Props) {
  const { contentTypesQuery } = props;

  const contentTypes = contentTypesQuery.webbuilderContentTypes || [];

  const updatedProps = {
    ...props,
    contentTypes,
    loading: contentTypesQuery.loading
  };

  return <ContentTypesList {...updatedProps} />;
}

export default compose(
  graphql(gql(queries.contentTypes), {
    name: 'contentTypesQuery'
  })
)(ContentTypesListContainer);
