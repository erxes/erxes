import gql from 'graphql-tag';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps } from 'modules/common/types';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import List from '../components/List';
import { mutations, queries } from '../graphql';
import {
  AddItemMutationResponse,
  EditMutationResponse,
  IChecklistItemDoc,
  RemoveMutationResponse
} from '../types';

type IProps = {
  listId: string;
};

type FinalProps = {
  checklistDetailQuery: any;
  addItemMutation: AddItemMutationResponse;
  editMutation: EditMutationResponse;
  removeMutation: RemoveMutationResponse;
} & IProps;

class ListContainer extends React.Component<FinalProps> {
  remove = (checklistId: string) => {
    const { removeMutation } = this.props;

    removeMutation({ variables: { _id: checklistId } });
  };

  addItem = (doc: { content: string }) => {
    const { addItemMutation, listId } = this.props;

    addItemMutation({
      variables: {
        checklistId: listId,
        ...doc
      }
    });
  };

  render() {
    const renderButton = ({
      values,
      isSubmitted,
      callback
    }: IButtonMutateProps) => {
      const callBackResponse = () => {
        if (callback) {
          callback();
        }
      };

      return (
        <ButtonMutate
          mutation={mutations.checklistsEdit}
          variables={values}
          callback={callBackResponse}
          refetchQueries={['checklistDetail']}
          isSubmitted={isSubmitted}
          btnSize="small"
          type="submit"
          successMessage={`You successfully edited a checklist`}
        />
      );
    };

    const { checklistDetailQuery } = this.props;

    if (checklistDetailQuery.loading) {
      return null;
    }

    const list = checklistDetailQuery.checklistDetail;

    const extendedProps = {
      list,
      addItem: this.addItem,
      renderButton,
      remove: this.remove
    };

    return <List {...extendedProps} />;
  }
}

const options = (props: IProps) => {
  return {
    refetchQueries: [
      {
        query: gql(queries.checklistDetail),
        variables: {
          _id: props.listId
        }
      }
    ]
  };
};

export default withProps<IProps>(
  compose(
    graphql<IProps>(gql(queries.checklistDetail), {
      name: 'checklistDetailQuery',
      options: ({ listId }) => ({
        variables: {
          _id: listId
        }
      })
    }),
    graphql<IProps, AddItemMutationResponse, IChecklistItemDoc>(
      gql(mutations.checklistItemsAdd),
      {
        name: 'addItemMutation',
        options
      }
    ),
    graphql<IProps, RemoveMutationResponse, { _id: string }>(
      gql(mutations.checklistsRemove),
      {
        name: 'removeMutation',
        options: () => ({
          refetchQueries: ['checklists']
        })
      }
    )
  )(ListContainer)
);
