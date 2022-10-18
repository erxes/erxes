import * as compose from 'lodash.flowright';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { confirm, withProps } from '@erxes/ui/src/utils';
import { Alert } from '@erxes/ui/src/utils';
import React from 'react';
import { MutationVariables } from '@erxes/ui/src/types';

interface ICopyMutationVariables extends MutationVariables {
  [key: string]: any;
}

function commonListComposer<ComponentProps>(options) {
  const {
    text,
    label,
    stringEditMutation,
    stringAddMutation,
    stringCopyMutation,
    copy,
    gqlListQuery,
    gqlTotalCountQuery,
    gqlRemoveMutation,
    gqlCopyMutation,
    ListComponent,
    gqlConfigsQuery,
    confirmProps,
    gqlGetActionsQuery
  } = options;

  type Props = {
    totalCountQuery: any;
    listQuery: any;
    history: any;
    addMutation: ({ variables }: { variables: any }) => Promise<any>;
    editMutation: ({ variables }: { variables: any }) => Promise<any>;
    removeMutation: ({
      variables: { _id }
    }: {
      variables: MutationVariables;
    }) => Promise<any>;
    copyMutation: ({
      variables: { _id, memberIds }
    }: {
      variables: ICopyMutationVariables;
    }) => Promise<any>;
    copy: boolean;
  };

  const ListContainer = (props: Props) => {
    const {
      copyMutation,
      listQuery,
      totalCountQuery,
      removeMutation,
      history
    } = props;

    const totalCount = totalCountQuery[`${label}TotalCount`] || 0;

    const objects = listQuery[label] || [];

    // remove action
    const remove = id => {
      let message;
      let confirmOptions = {};

      if (confirmProps) {
        message = confirmProps.message;
        confirmOptions = confirmProps.options;
      }

      confirm(message, confirmOptions).then(() => {
        removeMutation({
          variables: { _id: id }
        })
          .then(() => {
            // update queries
            listQuery.refetch();
            totalCountQuery.refetch();

            Alert.success(`You successfully deleted a ${text}.`);
          })
          .catch(error => {
            Alert.error(error.message);
          });
      });
    };

    const copyItem = (id: string, key: string, list: string[]) => {
      if (copyMutation) {
        copyMutation({ variables: { _id: id, [key]: list } })
          .then(() => {
            listQuery.refetch();
            totalCountQuery.refetch();

            Alert.success(`You successfully copied a ${text}`);
          })
          .catch(error => {
            Alert.error(error.message);
          });
      }
    };

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback,
      confirmationUpdate,
      object
    }: IButtonMutateProps) => {
      const afterMutate = () => {
        listQuery.refetch();
        totalCountQuery.refetch();

        if (callback) {
          callback();
        }
      };

      let mutation = stringAddMutation;
      let successAction = 'added';

      if (object) {
        mutation = stringEditMutation;
        successAction = 'updated';
      }

      if (copy === true && stringCopyMutation && gqlCopyMutation) {
        mutation = stringCopyMutation;
        successAction = 'copied';
      }

      return (
        <ButtonMutate
          mutation={mutation}
          variables={values}
          callback={afterMutate}
          isSubmitted={isSubmitted}
          type="submit"
          confirmationUpdate={confirmationUpdate}
          successMessage={`You successfully ${successAction} a ${name}`}
        />
      );
    };

    const updatedProps = {
      ...props,
      refetch: listQuery.refetch,
      objects,
      totalCount,
      remove,
      history,
      renderButton,
      loading: listQuery.loading,
      copyItem
    };

    return <ListComponent {...updatedProps} />;
  };

  const composeAttr = [gqlListQuery, gqlTotalCountQuery];

  if (gqlRemoveMutation) {
    composeAttr.push(gqlRemoveMutation);
  }

  if (gqlConfigsQuery) {
    composeAttr.push(gqlConfigsQuery);
  }

  if (gqlCopyMutation) {
    composeAttr.push(gqlCopyMutation);
  }

  if (gqlGetActionsQuery) {
    composeAttr.push(gqlGetActionsQuery);
  }

  console.log(...composeAttr, gqlListQuery, gqlTotalCountQuery);

  return withProps<ComponentProps>(
    compose(...composeAttr, gqlListQuery, gqlTotalCountQuery)(ListContainer)
  );
}

export default commonListComposer;
