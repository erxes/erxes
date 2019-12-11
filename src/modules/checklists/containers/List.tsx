import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import ButtonMutate from 'modules/common/components/ButtonMutate';
import { IButtonMutateProps } from 'modules/common/types';
import { Alert, confirm, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import List from '../components/List';
import { mutations, queries } from '../graphql';
import {
  AddItemMutationResponse,
  EditMutationResponse,
  IChecklistItemDoc,
  RemoveMutationResponse
} from '../types';

type Props = {
  listId: string;
};

type FinalProps = {
  checklistDetailQuery: any;
  addItemMutation: AddItemMutationResponse;
  editMutation: EditMutationResponse;
  removeMutation: RemoveMutationResponse;
} & Props;

class ListContainer extends React.Component<FinalProps> {
  remove = (checklistId: string) => {
    const { removeMutation } = this.props;

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
  };

  addItem = (item: string) => {
    const { addItemMutation, listId } = this.props;

    addItemMutation({
      variables: {
        checklistId: listId,
        content: item
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
          icon=""
          successMessage={`You successfully edited a checklist`}
        />
      );
    };

    const { checklistDetailQuery } = this.props;

    if (checklistDetailQuery.loading) {
      return null;
    }

    const item = checklistDetailQuery.checklistDetail;

    const extendedProps = {
      item,
      addItem: this.addItem,
      renderButton,
      remove: this.remove
    };

    return <List {...extendedProps} />;
  }
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
