import React from 'react';
import List from '../../components/templates/List';
import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { queries, mutations } from '../../graphql';
import {
  TemplatesQueryResponse,
  TemplatesRemoveMutationResponse,
  TemplatesTotalCountQueryResponse
} from '../../types';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Alert, confirm } from '@erxes/ui/src/utils';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';

type Props = {
  setCount: (count: number) => void;
  queryParams: any;
};

type FinalProps = {
  templatesQuery: TemplatesQueryResponse;
  templatesCountQuery: TemplatesTotalCountQueryResponse;
} & Props &
  TemplatesRemoveMutationResponse;

function ListContainer(props: FinalProps) {
  const { templatesQuery, templatesCountQuery, templatesRemove } = props;

  if (templatesQuery.loading || templatesCountQuery.loading) {
    return <Spinner objective={true} />;
  }

  const remove = (_id: string) => {
    confirm().then(() => {
      templatesRemove({ variables: { _id } })
        .then(() => {
          Alert.success('Successfully deleted a template');

          templatesQuery.refetch();
          templatesCountQuery.refetch();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  };

  const templates = templatesQuery.webbuilderTemplates || [];
  const templatesCount = templatesCountQuery.webbuilderTemplatesTotalCount || 0;

  const updatedProps = {
    ...props,
    templates,
    templatesCount,
    remove
  };

  return <List {...updatedProps} />;
}

export default compose(
  graphql<{}, TemplatesRemoveMutationResponse>(gql(mutations.templatesRemove), {
    name: 'templatesRemove'
  }),
  graphql<Props, TemplatesQueryResponse>(gql(queries.templates), {
    name: 'templatesQuery',
    options: ({ queryParams }) => ({
      variables: {
        ...generatePaginationParams(queryParams)
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
