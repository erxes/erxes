import client from 'apolloClient';
import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, renderWithProps } from 'modules/common/utils';
import { mutations } from 'modules/conformity/graphql/';
import {
  EditConformityMutation,
  IConformityEdit
} from 'modules/conformity/types';
import React from 'react';
import { graphql } from 'react-apollo';
import AddForm from '../../components/portable/AddForm';
import { mutations as boardMutations, queries } from '../../graphql';
import {
  ConvertToMutationResponse,
  ConvertToMutationVariables,
  IItem,
  IItemParams,
  IOptions,
  SaveMutation
} from '../../types';

type IProps = {
  options: IOptions;
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
  showSelect?: boolean;
  relType?: string;
  mailSubject?: string;
  sourceConversationId?: string;
  relTypeIds?: string[];
  assignedUserIds?: string[];
  getAssociatedItem?: (itemId: string) => void;
  closeModal: () => void;
  refetch?: () => void;
  aboveItemId?: string;
  type?: string;
  description?: string;
  attachments?: any[];
  bookingProductId?: string;
};

type FinalProps = {
  addMutation: SaveMutation;
  conversationConvertToCard: ConvertToMutationResponse;
  editConformity: EditConformityMutation;
} & IProps &
  ConvertToMutationResponse;

class AddFormContainer extends React.Component<FinalProps> {
  saveItem = (doc: IItemParams, callback: (item: IItem) => void) => {
    const {
      addMutation,
      conversationConvertToCard,
      options,
      assignedUserIds,
      sourceConversationId,
      description,
      attachments,
      relType,
      relTypeIds,
      editConformity,
      bookingProductId
    } = this.props;

    doc.assignedUserIds = assignedUserIds;

    const proccessId = Math.random().toString();

    localStorage.setItem('proccessId', proccessId);

    doc.proccessId = proccessId;
    doc.description = description;
    doc.attachments = attachments;

    if (sourceConversationId) {
      doc.sourceConversationIds = [sourceConversationId];

      conversationConvertToCard({
        variables: {
          _id: sourceConversationId || '',
          type: options.type,
          itemId: doc._id,
          itemName: doc.name,
          stageId: doc.stageId,
          bookingProductId
        }
      })
        .then(({ data }) => {
          const message = `You've successfully converted a conversation to ${options.type}`;

          if (!doc._id && relType && relTypeIds) {
            editConformity({
              variables: {
                mainType: options.type,
                mainTypeId: data.conversationConvertToCard,
                relType,
                relTypeIds
              }
            });
          }

          this.afterSave(message, callback, data);
        })
        .catch(error => {
          Alert.error(error.message);
        });
    } else {
      addMutation({ variables: doc })
        .then(({ data }) => {
          const message = `You've successfully created ${options.type}`;

          if (relType && relTypeIds) {
            editConformity({
              variables: {
                mainType: options.type,
                mainTypeId: data[options.mutationsName.addMutation]._id,
                relType,
                relTypeIds
              }
            });
          }

          this.afterSave(
            message,
            callback,
            data[options.mutationsName.addMutation]
          );
        })
        .catch(error => {
          Alert.error(error.message);
        });
    }
  };

  afterSave = (
    message: string,
    callback: (item: IItem) => void,
    item: IItem
  ) => {
    Alert.success(message);

    const { getAssociatedItem, refetch } = this.props;

    callback(item);

    if (getAssociatedItem) {
      getAssociatedItem(item._id);
    }

    if (refetch) {
      refetch();
    }
  };

  fetchCards = (stageId: string, callback: (cards: any) => void) => {
    const { type } = this.props.options;

    client
      .query({
        query: gql(queries[`${type}s`]),
        fetchPolicy: 'network-only',
        variables: { stageId, limit: 0 }
      })
      .then(({ data }: any) => {
        callback(data[`${type}s`]);
      });
  };

  render() {
    const extendedProps = {
      ...this.props,
      saveItem: this.saveItem,
      fetchCards: this.fetchCards
    };

    return <AddForm {...extendedProps} />;
  }
}

export default (props: IProps) =>
  renderWithProps<IProps>(
    props,
    compose(
      graphql<IProps, SaveMutation, IItem>(
        gql(props.options.mutations.addMutation),
        {
          name: 'addMutation',
          options: ({ stageId }: { stageId?: string }) => {
            if (!stageId) {
              return {};
            }

            return {
              refetchQueries: [
                {
                  query: gql(queries.stageDetail),
                  variables: { _id: stageId }
                }
              ]
            };
          }
        }
      ),
      graphql<IProps, ConvertToMutationResponse, ConvertToMutationVariables>(
        gql(boardMutations.conversationConvertToCard),
        {
          name: 'conversationConvertToCard'
        }
      ),
      graphql<FinalProps, EditConformityMutation, IConformityEdit>(
        gql(mutations.conformityEdit),
        {
          name: 'editConformity'
        }
      )
    )(AddFormContainer)
  );
