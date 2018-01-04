import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'react-apollo';
import { confirm } from 'modules/common/utils';
import { Alert } from 'modules/common/utils';

const commonListComposer = options => {
  const {
    name,
    gqlListQuery,
    gqlUsersQuery,
    gqlIntegrationsQuery,
    gqlTotalCountQuery,
    gqlAddMutation,
    gqlEditMutation,
    gqlRemoveMutation,
    ListComponent
  } = options;

  const ListContainer = props => {
    const {
      listQuery,
      usersQuery,
      integrationsQuery,
      totalCountQuery,
      addMutation,
      editMutation,
      removeMutation
    } = props;

    const totalCount = totalCountQuery[`${name}TotalCount`] || 0;

    const objects = listQuery[name] || [];
    const integrations = integrationsQuery.integrations || [];
    const members = usersQuery.users || [];

    let selectedMembers = [];

    // remove action
    const remove = _id => {
      confirm().then(() => {
        removeMutation({
          variables: { _id }
        })
          .then(() => {
            // update queries
            listQuery.refetch();
            usersQuery.refetch();
            integrationsQuery.refetch();
            totalCountQuery.refetch();

            Alert.success('Congrats', 'Successfully deleted.');
          })
          .catch(error => {
            Alert.error(error.message);
          });
      });
    };

    // create or update action
    const save = ({ doc }, callback, object) => {
      let mutation = addMutation;
      // if edit mode
      if (object) {
        mutation = editMutation;
        doc._id = object._id;
      }

      mutation({
        variables: doc
      })
        .then(() => {
          // update queries
          listQuery.refetch();
          usersQuery.refetch();
          integrationsQuery.refetch();
          totalCountQuery.refetch();

          Alert.success('Congrats');

          callback();
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const updatedProps = {
      ...this.props,
      refetch: listQuery.refetch,
      objects,
      integrations,
      selectedMembers,
      members,
      loading: listQuery.loading,
      totalCount,
      save,
      remove
    };

    return <ListComponent {...updatedProps} />;
  };

  ListContainer.propTypes = {
    totalCountQuery: PropTypes.object,
    integrationsQuery: PropTypes.object,
    usersQuery: PropTypes.object,
    listQuery: PropTypes.object,
    addMutation: PropTypes.func,
    editMutation: PropTypes.func,
    removeMutation: PropTypes.func
  };

  if (gqlAddMutation) {
    return compose(
      gqlListQuery,
      gqlUsersQuery,
      gqlIntegrationsQuery,
      gqlTotalCountQuery,
      // mutations
      gqlAddMutation,
      gqlEditMutation,
      gqlRemoveMutation
    )(ListContainer);
  }

  return compose(
    gqlListQuery,
    gqlUsersQuery,
    gqlIntegrationsQuery,
    gqlTotalCountQuery
  )(ListContainer);
};

export default commonListComposer;
