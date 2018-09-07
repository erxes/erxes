import * as React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Bulk, Spinner } from 'modules/common/components';
import { queries, mutations } from '../graphql';
import { List } from '../components';

class ListContainer extends Bulk {
  refetch() {
    this.props.integrationsQuery.refetch();
    this.props.integrationsTotalCountQuery.refetch();
  }

  render() {
    const {
      integrationsQuery,
      integrationsTotalCountQuery,
      tagsQuery,
      removeMutation
    } = this.props;

    if (integrationsQuery.loading || integrationsTotalCountQuery.loading) {
      return <Spinner />;
    }

    const counts = integrationsTotalCountQuery.integrationsTotalCount;
    const totalCount = counts.byKind.form || 0;
    const tagsCount = counts.byTag || {};

    const integrations = integrationsQuery.integrations || [];

    const remove = (_id, callback) => {
      removeMutation({
        variables: { _id }
      }).then(() => {
        // refresh queries
        integrationsQuery.refetch();
        integrationsTotalCountQuery.refetch();

        callback();
      });
    };

    const updatedProps = {
      ...this.props,
      integrations,
      remove,
      loading: integrationsQuery.loading,
      bulk: this.state.bulk || [],
      isAllSelected: this.state.isAllSelected,
      emptyBulk: this.emptyBulk,
      toggleBulk: this.toggleBulk,
      toggleAll: this.toggleAll,
      totalCount,
      tagsCount,
      tags: tagsQuery.tags || []
    };

    return <List {...updatedProps} />;
  }
}

ListContainer.propTypes = {
  integrationsTotalCountQuery: PropTypes.object,
  integrationsQuery: PropTypes.object,
  tagsQuery: PropTypes.object,
  removeMutation: PropTypes.func
};

export default compose(
  graphql(gql(queries.integrations), {
    name: 'integrationsQuery',
    options: ({ queryParams }) => {
      return {
        variables: {
          page: queryParams.page,
          perPage: queryParams.perPage || 20,
          tag: queryParams.tag,
          kind: 'form'
        },
        fetchPolicy: 'network-only'
      };
    }
  }),
  graphql(gql(queries.integrationsTotalCount), {
    name: 'integrationsTotalCountQuery',
    options: () => ({
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(queries.tags), {
    name: 'tagsQuery',
    options: () => ({
      variables: {
        type: 'integration'
      },
      fetchPolicy: 'network-only'
    })
  }),
  graphql(gql(mutations.integrationRemove), {
    name: 'removeMutation'
  })
)(ListContainer);
