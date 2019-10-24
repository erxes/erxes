import gql from 'graphql-tag';
import { renderWithProps } from 'modules/common/utils';
import React from 'react';
import { compose, graphql } from 'react-apollo';
import Item from '../components/Item';
import { mutations, queries } from '../graphql';
import {
  EditItemMutationResponse,
  EditItemMutationVariables,
  IChecklistItem,
  RemoveItemMutationResponse
} from '../types';

type IProps = {
  item: IChecklistItem;
};

type FinalProps = {
  editItemMutation: EditItemMutationResponse;
  removeItemMutation: RemoveItemMutationResponse;
} & IProps;

class ItemContainer extends React.Component<FinalProps> {
  editItem = (
    doc: { content: string; isChecked: boolean },
    callback?: () => void
  ) => {
    const { editItemMutation, item } = this.props;

    editItemMutation({
      variables: {
        ...doc,
        _id: item._id
      }
    }).then(() => {
      if (callback) {
        callback();
      }
    });
  };

  removeItem = (checklistItemId: string) => {
    const { removeItemMutation } = this.props;

    removeItemMutation({ variables: { _id: checklistItemId } });
  };

  render() {
    const { item } = this.props;

    const extendedProps = {
      item,
      editItem: this.editItem,
      removeItem: this.removeItem
    };

    return <Item {...extendedProps} />;
  }
}

const options = (props: IProps) => {
  return {
    refetchQueries: [
      {
        query: gql(queries.checklistDetail),
        variables: {
          _id: props.item.checklistId
        }
      }
    ]
  };
};

export default (props: IProps) =>
  renderWithProps<IProps>(
    props,
    compose(
      graphql<IProps, EditItemMutationResponse, EditItemMutationVariables>(
        gql(mutations.checklistItemsEdit),
        {
          name: 'editItemMutation',
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
    )(ItemContainer)
  );
