import React from 'react';
import PropTypes from 'prop-types';
import { compose, graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Bulk, Spinner } from 'modules/common/components';
import { queries, mutations } from '../graphql';
import { List } from '../components';

class ListContainer extends Bulk {
  refetch() {
    this.props.integrationsQuery.refetch();
  }

  render() {
    const {
      integrationsQuery,
      integrationsCountQuery,
      usersQuery,
      tagsQuery,
      removeMutation
    } = this.props;

    if (integrationsQuery.loading || integrationsCountQuery.loading) {
      return <Spinner />;
    }

    const integrationsCount =
      integrationsCountQuery.integrationsTotalCount.byKind.form || 0;
    const integrations = integrationsQuery.integrations || [];
    const members = usersQuery.users || [];

    const remove = (_id, callback) => {
      removeMutation({
        variables: { _id }
      }).then(() => {
        // refresh queries
        integrationsQuery.refetch();
        integrationsCountQuery.refetch();

        callback();
      });
    };

    const updatedProps = {
      ...this.props,
      integrations,
      integrationsCount,
      members,
      remove,
      loading: integrationsQuery.loading,
      bulk: this.state.bulk || [],
      isAllSelected: this.state.isAllSelected,
      emptyBulk: this.emptyBulk,
      toggleBulk: this.toggleBulk,
      toggleAll: this.toggleAll,
      tags: tagsQuery.tags || []
    };

    return <List {...updatedProps} />;
  }
}

ListContainer.propTypes = {
  integrationsCountQuery: PropTypes.object,
  integrationsQuery: PropTypes.object,
  usersQuery: PropTypes.object,
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
        }
      };
    }
  }),
  graphql(gql(queries.integrationsCount), {
    name: 'integrationsCountQuery'
  }),
  graphql(gql(queries.users), {
    name: 'usersQuery'
  }),
  graphql(gql(queries.tags), {
    name: 'tagsQuery',
    options: () => ({
      variables: {
        type: 'integration'
      }
    })
  }),
  graphql(gql(mutations.integrationRemove), {
    name: 'removeMutation'
  })
)(ListContainer);
