import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { IItemParams } from '../../boards/types';
import ButtonMutate from '@erxes/ui/src/components/ButtonMutate';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { Alert, confirm, withProps } from '@erxes/ui/src/utils';
import React, { useEffect } from 'react';
import { graphql } from '@apollo/client/react/hoc';
import List from '../components/List';
import { mutations, queries, subscriptions } from '../graphql';
import {
  AddItemMutationResponse,
  EditMutationResponse,
  IChecklistItemDoc,
  IChecklistItemsUpdateOrderDoc,
  RemoveMutationResponse,
  UpdateItemsOrderMutationResponse
} from '../types';

type Props = {
  listId: string;
  stageId: string;
  addItem: (doc: IItemParams, callback: () => void) => void;
};

type FinalProps = {
  checklistDetailQuery: any;
  addItemMutation: AddItemMutationResponse;
  checklistItemsOrderMutation: UpdateItemsOrderMutationResponse;
  convertToCardMutations;
  editMutation: EditMutationResponse;
  removeMutation: RemoveMutationResponse;
} & Props;

function ListContainer(props: FinalProps) {
  const { checklistDetailQuery, listId } = props;

  useEffect(() => {
    return checklistDetailQuery.subscribeToMore({
      document: gql(subscriptions.checklistDetailChanged),
      variables: { _id: listId },
      updateQuery: () => {
        checklistDetailQuery.refetch();
      }
    });
  });

  function updateOrderItems(sourceItem, destinationIndex) {
    const { checklistItemsOrderMutation } = props;

    checklistItemsOrderMutation({
      variables: {
        _id: sourceItem._id,
        destinationIndex
      }
    });
  }

  function remove(checklistId: string) {
    const { removeMutation } = props;

    confirm().then(() => {
      removeMutation({ variables: { _id: checklistId } })
        .then(() => {
          Alert.success('You successfully deleted a checklist');
          localStorage.removeItem(checklistId);
        })
        .catch(e => {
          Alert.error(e.message);
        });
    });
  }

  function addItem(content: string) {
    const { addItemMutation } = props;

    addItemMutation({
      variables: {
        checklistId: listId,
        content
      }
    });
  }

  function convertToCard(name: string, callback: () => void) {
    const { stageId } = props;

    const afterConvert = () => {
      callback();
      Alert.success('You successfully converted a card');
    };

    props.addItem({ stageId, name }, afterConvert);
  }

  function renderButton({ values, isSubmitted, callback }: IButtonMutateProps) {
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
        icon="check-1"
      />
    );
  }

  if (checklistDetailQuery.loading) {
    return null;
  }

  const item = checklistDetailQuery.checklistDetail;

  const listProps = {
    item,
    addItem,
    renderButton,
    remove,
    convertToCard,
    updateOrderItems
  };

  return <List {...listProps} />;
} // end ListContainer()

const options = (props: Props) => ({
  refetchQueries: [
    {
      query: gql(queries.checklistDetail),
      variables: { _id: props.listId }
    }
  ]
});

export default withProps<Props>(
  compose(
    graphql<Props>(gql(queries.checklistDetail), {
      name: 'checklistDetailQuery',
      options: ({ listId }) => ({
        variables: {
          _id: listId
        }
      })
    }),
    graphql<Props, AddItemMutationResponse, IChecklistItemDoc>(
      gql(mutations.checklistItemsAdd),
      {
        name: 'addItemMutation',
        options
      }
    ),
    graphql<
      Props,
      UpdateItemsOrderMutationResponse,
      IChecklistItemsUpdateOrderDoc
    >(gql(mutations.checklistItemsOrder), {
      name: 'checklistItemsOrderMutation',
      options
    }),
    graphql<Props, RemoveMutationResponse, { _id: string }>(
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
