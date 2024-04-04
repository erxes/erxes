import * as compose from 'lodash.flowright';

import {
  TemplatesQueryResponse,
  TemplatesTotalCountQueryResponse
} from '../../types';

import List from '../../components/templates/List';
import React from 'react';
import Spinner from '@erxes/ui/src/components/Spinner';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';
import { gql } from '@apollo/client';
import { graphql } from '@apollo/client/react/hoc';
import { queries } from '../../graphql';

type Props = {
  queryParams: any;
};

type FinalProps = {
  templatesQuery: TemplatesQueryResponse;
  templatesCountQuery: TemplatesTotalCountQueryResponse;
} & Props;

function ListContainer(props: FinalProps) {
  const { templatesQuery, templatesCountQuery } = props;

  if (templatesQuery.loading || templatesCountQuery.loading) {
    return <Spinner objective={true} />;
  }

  const templates = templatesQuery.webbuilderTemplates || [];
  const templatesCount = templatesCountQuery.webbuilderTemplatesTotalCount || 0;

  const updatedProps = {
    ...props,
    templates,
    templatesCount
  };

  return <List {...updatedProps} />;
}

export default compose(
  graphql<Props, TemplatesQueryResponse>(gql(queries.templates), {
    name: 'templatesQuery',
    options: ({ queryParams }) => ({
      variables: {
        ...generatePaginationParams(queryParams),
        searchValue: queryParams.searchValue || ''
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql<{}, TemplatesTotalCountQueryResponse>(
    gql(queries.templatesTotalCount),
    {
      name: 'templatesCountQuery'
    }
  )
)(ListContainer);
