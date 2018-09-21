import { confirm } from 'modules/common/utils';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { compose } from 'react-apollo';

const commonListComposer = options => {
  const {
    name,
    gqlListQuery,
    gqlTotalCountQuery,
    gqlAddMutation,
    gqlEditMutation,
    gqlRemoveMutation,
    ListComponent
  } = options;

  type Props = {
    totalCountQuery: any;
    listQuery: any;
    addMutation: ({ variables: any }) => Promise<any>;
    editMutation: ({ variables: any }) => Promise<any>;
    removeMutation: ({ variables: { _id: string } }) => Promise<any>;
  };

  const ListContainer = (props: Props) => {
    const {
      listQuery,
      totalCountQuery,
      addMutation,
      editMutation,
      removeMutation
    } = props;

    const totalCount = totalCountQuery[`${name}TotalCount`] || 0;

    const objects = listQuery[name] || [];

    // remove action
    const remove = _id => {
      confirm().then(() => {
        removeMutation({
          variables: { _id }
        })
          .then(() => {
            // update queries
            listQuery.refetch();
            totalCountQuery.refetch();

            Alert.success('Congrats, Successfully deleted.');
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
          totalCountQuery.refetch();

          Alert.success('Congrats');

          callback();
        })
        .catch(error => {
          Alert.error(error.message);
        });
    };

    const updatedProps = {
      ...props,
      refetch: listQuery.refetch,
      objects,
      totalCount,
      save,
      remove,
      loading: listQuery.loading
    };

    return <ListComponent {...updatedProps} />;
  };

  if (gqlAddMutation) {
    return compose(
      gqlListQuery,
      gqlTotalCountQuery,
      // mutations
      gqlAddMutation,
      gqlEditMutation,
      gqlRemoveMutation
    )(ListContainer);
  }

  return compose(gqlListQuery, gqlTotalCountQuery)(ListContainer);
};

export default commonListComposer;
