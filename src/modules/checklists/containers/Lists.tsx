import gql from 'graphql-tag';
import { renderWithProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import Lists from '../components/Lists';
import { mutations, queries } from '../graphql';
import {
  AddItemMutationResponse,
  ChecklistsQueryResponse,
  EditItemMutationResponse,
  EditItemMutationVariables,
  EditMutationResponse,
  EditMutationVariables,
  IChecklistItem,
  IChecklistItemDoc,
  IChecklistsParam,
  IChecklistsState,
  RemoveItemMutationResponse,
  RemoveMutationResponse,
  UpdateOrderItemsMutationResponse,
  UpdateOrderItemsVariables
} from '../types';

type IProps = {
  contentType: string;
  contentTypeId: string;
  onSelect: (checklistsState: IChecklistsState) => void;
  checklistsState: IChecklistsState;
};

type FinalProps = {
  checklistsQuery: ChecklistsQueryResponse;
  editMutation: EditMutationResponse;
  addItemMutation: AddItemMutationResponse;
  editItemMutation: EditItemMutationResponse;
  updateOrderMutation: UpdateOrderItemsMutationResponse;
  removeMutation: RemoveMutationResponse;
  removeItemMutation: RemoveItemMutationResponse;
} & IProps;

class ChecklistsContainer extends React.Component<FinalProps> {
  edit = (doc: EditMutationVariables, callback: () => void) => {
    const { editMutation } = this.props;
    editMutation({ variables: doc }).then(() => {
      callback();
    });
  };

  remove = (checklistId: string, callback: () => void) => {
    const { removeMutation } = this.props;

    removeMutation({ variables: { _id: checklistId } }).then(() => {
      callback();
    });
  };

  addItem = (doc: IChecklistItemDoc, callback: () => void) => {
    const { addItemMutation } = this.props;

    addItemMutation({ variables: doc }).then(() => {
      callback();
    });
  };

  editItem = (doc: IChecklistItem, callback: () => void) => {
    const { editItemMutation } = this.props;

    editItemMutation({ variables: doc }).then(() => {
      callback();
    });
  };

  updateOrder = (orders: [UpdateOrderItemsVariables]) => {
    // const { updateOrderMutation } = this.props;
    // updateOrderMutation({ variables: { orders } });
  };

  removeItem = (checklistItemId: string, callback: () => void) => {
    const { removeItemMutation } = this.props;

    removeItemMutation({ variables: { _id: checklistItemId } }).then(() => {
      callback();
    });
  };

  render() {
    const { checklistsQuery } = this.props;

    if (!checklistsQuery) {
      return null;
    }

    const checklists = checklistsQuery.checklists || [];

    const extendedProps = {
      ...this.props,
      checklists,
      edit: this.edit,
      remove: this.remove,
      addItem: this.addItem,
      editItem: this.editItem,
      updateOrder: this.updateOrder,
      removeItem: this.removeItem
    };

    return <Lists {...extendedProps} />;
  }
}

const options = param => {
  return {
    refetchQueries: [
      {
        query: gql(queries.checklists),
        variables: {
          contentType: param.contentType,
          contentTypeId: param.contentTypeId
        }
      }
    ]
  };
};

export default (props: IProps) =>
  renderWithProps<IProps>(
    props,
    compose(
      graphql<IProps, ChecklistsQueryResponse, IChecklistsParam>(
        gql(queries.checklists),
        {
          name: 'checklistsQuery',
          options: () => ({
            variables: {
              contentType: props.contentType,
              contentTypeId: props.contentTypeId
            }
          })
        }
      ),
      graphql<IProps, EditMutationResponse, EditMutationVariables>(
        gql(mutations.checklistsEdit),
        {
          name: 'editMutation',
          options
        }
      ),
      graphql<IProps, AddItemMutationResponse, IChecklistItemDoc>(
        gql(mutations.checklistItemsAdd),
        {
          name: 'addItemMutation',
          options
        }
      ),
      graphql<IProps, EditItemMutationResponse, EditItemMutationVariables>(
        gql(mutations.checklistItemsEdit),
        {
          name: 'editItemMutation',
          options
        }
      ),
      graphql<IProps, RemoveMutationResponse, { _id: string }>(
        gql(mutations.checklistsRemove),
        {
          name: 'removeMutation',
          options
        }
      ),
      graphql<IProps, RemoveItemMutationResponse, { _id: string }>(
        gql(mutations.checklistItemsRemove),
        {
          name: 'removeItemMutation',
          options
        }
      ),
      graphql<
        IProps,
        UpdateOrderItemsMutationResponse,
        UpdateOrderItemsVariables
      >(gql(mutations.updateOrderItems), {
        name: 'updateOrderMutation',
        options
      })
    )(ChecklistsContainer)
  );
