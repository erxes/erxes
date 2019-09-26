import gql from 'graphql-tag';
import { confirm, renderWithProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import Checklists from '../components/Checklists';
import { mutations, queries } from '../graphql';
import {
  AddItemMutationResponse,
  EditMutationResponse,
  EditMutationVariables,
  IChecklistItemDoc
} from '../types';
import {
  ChecklistsQueryResponse,
  EditItemMutationResponse,
  EditItemMutationVariables,
  IChecklistsParam,
  RemoveItemMutationResponse,
  RemoveMutationResponse
} from '../types';

type IProps = {
  contentType: string;
  contentTypeId: string;
};

type FinalProps = {
  checklistsQuery: ChecklistsQueryResponse;
  editMutation: EditMutationResponse;
  addItemMutation: AddItemMutationResponse;
  editItemMutation: EditItemMutationResponse;
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

  remove = (checklistId: string) => {
    const { removeMutation } = this.props;

    confirm().then(() => removeMutation({ variables: { _id: checklistId } }));
  };

  addItem = (doc: IChecklistItemDoc, callback: () => void) => {
    const { addItemMutation } = this.props;

    addItemMutation({ variables: doc }).then(() => {
      callback();
    });
  };

  removeItem = (checklistItemId: string) => {
    const { removeItemMutation } = this.props;

    confirm().then(() =>
      removeItemMutation({ variables: { _id: checklistItemId } })
    );
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
      removeItem: this.removeItem
    };

    return <Checklists {...extendedProps} />;
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
      )
    )(ChecklistsContainer)
  );
