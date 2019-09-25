import gql from 'graphql-tag';
import { confirm, renderWithProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import Checklists from '../components/Checklists';
import { mutations, queries } from '../graphql';
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
  editItemMutation: EditItemMutationResponse;
  removeMutation: RemoveMutationResponse;
  removeItemMutation: RemoveItemMutationResponse;
} & IProps;

class ChecklistsContainer extends React.Component<FinalProps> {
  //   onChangeItems = () => {
  //     const { checklistsQuery } = this.props;

  //     checklistsQuery.refetch();
  //   };
  removeChecklist = (checklistId: string) => {
    const { removeMutation } = this.props;

    confirm().then(() => removeMutation({ variables: { _id: checklistId } }));
  };

  removeChecklistItem = (checklistItemId: string) => {
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
      removeChecklist: this.removeChecklist,
      removeChecklistItem: this.removeChecklistItem
    };

    return <Checklists {...extendedProps} />;
  }
}

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
      graphql<IProps, EditItemMutationResponse, EditItemMutationVariables>(
        gql(mutations.checklistItemsRemove),
        {
          name: 'editItemMutation'
        }
      ),
      graphql<IProps, RemoveMutationResponse, { _id: string }>(
        gql(mutations.checklistsRemove),
        {
          name: 'removeMutation'
        }
      ),
      graphql<IProps, RemoveItemMutationResponse, { _id: string }>(
        gql(mutations.checklistItemsRemove),
        {
          name: 'removeItemMutation'
        }
      )
    )(ChecklistsContainer)
  );
