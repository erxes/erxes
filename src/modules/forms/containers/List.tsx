import gql from 'graphql-tag';
import { Bulk } from 'modules/common/components';
import { generatePaginationParams } from 'modules/common/utils/router';
import * as React from 'react';
import { compose, graphql } from 'react-apollo';
import { Alert, withProps } from '../../common/utils';
import { TagsQueryResponse } from '../../tags/types';
import { List } from '../components';
import { mutations, queries } from '../graphql';
import {
  CountQueryResponse,
  FormIntegrationsQueryResponse,
  RemoveMutationResponse,
  RemoveMutationVariables
} from '../types';

type Props = {
  queryParams: any;
};

type FinalProps = {
  integrationsTotalCountQuery: CountQueryResponse;
  integrationsQuery: FormIntegrationsQueryResponse;
  tagsQuery: TagsQueryResponse;
} & RemoveMutationResponse &
  Props;

class ListContainer extends React.Component<FinalProps, {}> {
  render() {
    const {
      integrationsQuery,
      integrationsTotalCountQuery,
      tagsQuery,
      removeMutation
    } = this.props;

    const counts = integrationsTotalCountQuery.integrationsTotalCount || {
      byKind: {}
    };
    const totalCount = counts.byKind.form || 0;
    const tagsCount = counts.byTag || {};

    const integrations = integrationsQuery.integrations || [];

    const remove = (integrationId: string, callback: (error?: any) => void) => {
      removeMutation({
        variables: { _id: integrationId }
      })
        .then(() => {
          // refresh queries
          integrationsQuery.refetch();
          integrationsTotalCountQuery.refetch();

          callback();
        })
        .catch(e => {
          Alert.error(e.message);
        });
    };

    const updatedProps = {
      ...this.props,
      integrations,
      remove,
      loading: integrationsQuery.loading,
      totalCount,
      tagsCount,
      tags: tagsQuery.tags || []
    };

    const content = props => {
      return <List {...updatedProps} {...props} />;
    };

    const refetch = () => {
      this.props.integrationsQuery.refetch();
      this.props.integrationsTotalCountQuery.refetch();
    };

    return <Bulk content={content} refetch={refetch} />;
  }
}

export default withProps<Props>(
  compose(
    graphql<
      Props,
      FormIntegrationsQueryResponse,
      { page?: number; perPage?: number; tag?: string; kind?: string }
    >(gql(queries.integrations), {
      name: 'integrationsQuery',
      options: ({ queryParams }) => {
        return {
          variables: {
            ...generatePaginationParams(queryParams),
            tag: queryParams.tag,
            kind: 'form'
          }
        };
      }
    }),
    graphql<Props, CountQueryResponse>(gql(queries.integrationsTotalCount), {
      name: 'integrationsTotalCountQuery'
    }),
    graphql<Props, TagsQueryResponse, { type: string }>(gql(queries.tags), {
      name: 'tagsQuery',
      options: () => ({
        variables: {
          type: 'integration'
        }
      })
    }),
    graphql<Props, RemoveMutationResponse, RemoveMutationVariables>(
      gql(mutations.integrationRemove),
      {
        name: 'removeMutation'
      }
    )
  )(ListContainer)
);
