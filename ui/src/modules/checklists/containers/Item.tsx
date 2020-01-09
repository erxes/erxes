import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import Item from '../components/Item';
import { mutations, queries } from '../graphql';
import {
  EditItemMutationResponse,
  EditItemMutationVariables,
  IChecklistItem,
  RemoveItemMutationResponse
} from '../types';

type Props = {
  item: IChecklistItem;
  convertToCard: (name: string, callback: () => void) => void;
};

type FinalProps = {
  editItemMutation: EditItemMutationResponse;
  removeItemMutation: RemoveItemMutationResponse;
} & Props;

class ItemContainer extends React.Component<FinalProps> {
  render() {
    const { editItemMutation, item, removeItemMutation } = this.props;

    const editItem = (
      doc: { content: string; isChecked: boolean },
      callback?: () => void
    ) => {
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

    const removeItem = (checklistItemId: string) => {
      removeItemMutation({ variables: { _id: checklistItemId } });
    };

    const extendedProps = {
      ...this.props,
      item,
      editItem,
      removeItem
    };

    return <Item {...extendedProps} />;
  }
}

const options = (props: Props) => {
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

export default withProps<Props>(
  compose(
    graphql<Props, EditItemMutationResponse, EditItemMutationVariables>(
      gql(mutations.checklistItemsEdit),
      {
        name: 'editItemMutation',
        options
      }
    ),
    graphql<Props, RemoveItemMutationResponse, { _id: string }>(
      gql(mutations.checklistItemsRemove),
      {
        name: 'removeItemMutation',
        options
      }
    )
  )(ItemContainer)
);
