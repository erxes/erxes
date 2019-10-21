import gql from 'graphql-tag';
import { renderWithProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import List from '../components/List';
import { mutations, queries } from '../graphql';
import {
  AddItemMutationResponse,
  EditMutationResponse,
  EditMutationVariables,
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
  edit = (doc: { title: string }) => {
    const { editMutation, listId } = this.props;

    editMutation({
      variables: {
        _id: listId,
        ...doc
      }
    });
  };

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
    const { checklistDetailQuery } = this.props;

    if (checklistDetailQuery.loading) {
      return null;
    }

    const list = checklistDetailQuery.checklistDetail;

    const extendedProps = {
      list,
      addItem: this.addItem,
      edit: this.edit,
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

export default (props: IProps) =>
  renderWithProps<IProps>(
    props,
    compose(
      graphql<IProps>(gql(queries.checklistDetail), {
        name: 'checklistDetailQuery',
        options: () => ({
          variables: {
            _id: props.listId
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
      graphql<IProps, EditMutationResponse, EditMutationVariables>(
        gql(mutations.checklistsEdit),
        {
          name: 'editMutation',
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
