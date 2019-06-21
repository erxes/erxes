import { ButtonMutate } from 'modules/common/components';
import { IButtonMutateProps } from 'modules/common/types';
import { __, confirm, withProps } from 'modules/common/utils';
import { Alert } from 'modules/common/utils';
import * as React from 'react';
import { compose } from 'react-apollo';

interface IRemoveMutationVariables {
  _id: string;
}

function commonListComposer<ComponentProps>(options) {
  const {
    text,
    label,
    stringEditMutation,
    stringAddMutation,
    gqlListQuery,
    gqlTotalCountQuery,
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
    const { listQuery, totalCountQuery, removeMutation, history } = props;

    const totalCount = totalCountQuery[`${label}TotalCount`] || 0;

    const objects = listQuery[label] || [];

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

            Alert.success(`You successfully deleted a ${text}.`);
          })
          .catch(error => {
            Alert.error(error.message);
          });
      });
    };

    const renderButton = ({
      name,
      values,
      isSubmitted,
      callback,
      object
    }: IButtonMutateProps) => {
      const afterMutate = () => {
        listQuery.refetch();
        totalCountQuery.refetch();

        if (callback) {
          callback();
        }
      };

      return (
        <ButtonMutate
          mutation={object ? stringEditMutation : stringAddMutation}
          variables={values}
          callback={afterMutate}
          isSubmitted={isSubmitted}
          type="submit"
          successMessage={`You successfully ${
            object ? 'updated' : 'added'
          } a ${name}`}
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
      loading: listQuery.loading
    };

    return <ListComponent {...updatedProps} />;
  };

  const composeAttr = [gqlListQuery, gqlTotalCountQuery];

  if (gqlRemoveMutation) {
    composeAttr.push(gqlRemoveMutation);
  }

  return withProps<ComponentProps>(
    compose(
      ...composeAttr,
      gqlListQuery,
      gqlTotalCountQuery
    )(ListContainer)
  );
}

export default commonListComposer;
