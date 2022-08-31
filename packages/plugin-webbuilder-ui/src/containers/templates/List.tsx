import React from 'react';
import List from '../../components/templates/List';
import * as compose from 'lodash.flowright';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { queries, mutations } from '../../graphql';
import {
  TemplatesQueryResponse,
  TemplatesTotalCountQueryResponse,
  TemplatesUseMutationResponse
} from '../../types';
import Spinner from '@erxes/ui/src/components/Spinner';
import { Alert, confirm } from '@erxes/ui/src/utils';
import { generatePaginationParams } from '@erxes/ui/src/utils/router';

type Props = {
  setCount: (count: number) => void;
  queryParams: any;
  selectedSite: string;
};

type FinalProps = {
  templatesQuery: TemplatesQueryResponse;
  templatesCountQuery: TemplatesTotalCountQueryResponse;
} & Props &
  TemplatesUseMutationResponse;

function ListContainer(props: FinalProps) {
  const { templatesQuery, templatesCountQuery, templatesUse } = props;

  if (templatesQuery.loading || templatesCountQuery.loading) {
    return <Spinner objective={true} />;
  }

  const use = (_id: string, name: string) => {
    const message = `Are you sure to create a website using this template? The site will automatically generate!`;

    confirm(message).then(() => {
      templatesUse({ variables: { _id, name } })
        .then(() => {
          Alert.success('Successfully created a website');
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
    use
  };

  return <List {...updatedProps} />;
}

export default compose(
  graphql<Props, TemplatesUseMutationResponse>(gql(mutations.templatesUse), {
    name: 'templatesUse',
    options: ({ selectedSite }) => ({
      refetchQueries: [
        { query: gql(queries.sites), variables: { fromSelect: true } },
        { query: gql(queries.sitesTotalCount) },
        {
          query: gql(queries.contentTypes),
          variables: {
            siteId: selectedSite
          }
        }
      ]
    })
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
