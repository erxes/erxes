import { confirm, withProps } from 'modules/common/utils';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { compose } from 'react-apollo';

interface IRemoveMutationVariables {
  _id: string;
}

function commonListComposer<ComponentProps>(options) {
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
    history: any;
    addMutation: ({ variables }: { variables: any }) => Promise<any>;
    editMutation: ({ variables }: { variables: any }) => Promise<any>;
    removeMutation: (
      {
        variables: { _id }
      }: { variables: IRemoveMutationVariables }
    ) => Promise<any>;
  };

  const ListContainer = (props: Props) => {
    const {
      listQuery,
      totalCountQuery,
      addMutation,
      editMutation,
      removeMutation,
      history
    } = props;

    const totalCount = totalCountQuery[`${name}TotalCount`] || 0;

    const objects = listQuery[name] || [];

    // remove action
    const remove = id => {
      confirm().then(() => {
        removeMutation({
          variables: { _id: id }
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
      history,
      loading: listQuery.loading
    };

    return <ListComponent {...updatedProps} />;
  };

  const composeAttr = [
    gqlListQuery,
    gqlTotalCountQuery,
    // mutations
    gqlAddMutation,
    gqlEditMutation
  ];

  if (gqlRemoveMutation) {
    composeAttr.push(gqlRemoveMutation);
  }

  if (gqlAddMutation) {
    return withProps<ComponentProps>(compose(...composeAttr)(ListContainer));
  }

  return withProps<ComponentProps>(
    compose(
      gqlListQuery,
      gqlTotalCountQuery
    )(ListContainer)
  );
}

export default commonListComposer;
