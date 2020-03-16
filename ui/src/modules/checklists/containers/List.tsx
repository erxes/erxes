import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { IItemParams } from 'modules/boards/types';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps } from 'modules/common/types';
import { Alert, confirm, withProps } from 'modules/common/utils';
import React, { useEffect } from 'react';
import { graphql } from 'react-apollo';
import List from '../components/List';
import { mutations, queries, subscriptions } from '../graphql';
import {
  AddItemMutationResponse,
  EditMutationResponse,
  IChecklistItemDoc,
  RemoveMutationResponse
} from '../types';

type Props = {
  listId: string;
  stageId: string;
  addItem: (doc: IItemParams, callback: () => void) => void;
};

type FinalProps = {
  checklistDetailQuery: any;
  addItemMutation: AddItemMutationResponse;
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
        icon=""
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
    convertToCard
  };

  return <List {...listProps} />;
}

const options = (props: Props) => {
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
