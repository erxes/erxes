import client from '@erxes/ui/src/apolloClient';
import { gql } from '@apollo/client';
import * as compose from 'lodash.flowright';
import { Alert, renderWithProps } from '@erxes/ui/src/utils';
import { mutations } from '../../../conformity/graphql';
import {
  EditConformityMutation,
  IConformityEdit
} from '../../../conformity/types';
import React from 'react';
import { graphql } from '@apollo/client/react/hoc';
import AddForm from '../../components/portable/AddForm';
import { mutations as boardMutations, queries } from '../../graphql';
import { queries as formQueries } from '@erxes/ui-forms/src/forms/graphql';
import {
  ConvertToMutationResponse,
  ConvertToMutationVariables,
  IItem,
  IItemParams,
  IOptions,
  SaveMutation,
  StagesQueryResponse
} from '../../types';
import { isEnabled } from '@erxes/ui/src/utils/core';

type IProps = {
  options: IOptions;
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
  parentId?: string;
  showSelect?: boolean;
  relType?: string;
  mailSubject?: string;
  sourceConversationId?: string;
  relTypeIds?: string[];
  assignedUserIds?: string[];
  getAssociatedItem?: (itemId: IItem) => void;
  closeModal: () => void;
  refetch?: () => void;
  aboveItemId?: string;
  type?: string;
  description?: string;
  attachments?: any[];
  bookingProductId?: string;
  tagIds?: string[];
  startDate?: Date;
  closeDate?: Date;
  showStageSelect?: boolean;
};

type FinalProps = {
  addMutation: SaveMutation;
  conversationConvertToCard: ConvertToMutationResponse;
  editConformity: EditConformityMutation;
  fieldsQuery: any;
  stagesQuery: StagesQueryResponse;
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
      bookingProductId,
      parentId
    } = this.props;

    doc.assignedUserIds = doc.assignedUserIds || assignedUserIds;

    const proccessId = Math.random().toString();

    localStorage.setItem('proccessId', proccessId);

    doc.proccessId = proccessId;
    doc.description = doc.description || description;
    doc.attachments = doc.attachments || attachments;
    doc.parentId = parentId;

    if (sourceConversationId) {
      doc.sourceConversationIds = [sourceConversationId];

      conversationConvertToCard({
        variables: {
          ...doc,
          type: options.type,
          itemId: doc._id,
          itemName: doc.name,
          stageId: doc.stageId,
          bookingProductId,
          _id: sourceConversationId || ''
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

          if (doc.relationData && Object.keys(doc.relationData).length > 0) {
            const { relationData } = doc;

            for (const key in relationData) {
              if (relationData.hasOwnProperty(key)) {
                client.mutate({
                  mutation: gql(mutations.conformityEdit),
                  variables: {
                    mainType: options.type,
                    mainTypeId: data[options.mutationsName.addMutation]._id,
                    relType: key,
                    relTypeIds: relationData[key]
                  }
                });
              }
            }
          }

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
      const { type } = this.props.options;
      client
        .query({
          query: gql(queries[`${type}s`]),
          fetchPolicy: 'network-only',
          variables: { stageId: item.stageId, _ids: [item._id] }
        })
        .then(({ data }: any) => {
          if (data && data[`${type}s`] && data[`${type}s`].length) {
            getAssociatedItem(data[`${type}s`][0]);
          }
        });
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
    const { fieldsQuery, stagesQuery } = this.props;

    const extendedProps = {
      ...this.props,
      fields: fieldsQuery?.fields || [],
      refetchFields: fieldsQuery?.refetch,
      saveItem: this.saveItem,
      fetchCards: this.fetchCards,
      stages: stagesQuery?.stages || []
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
      ),
      graphql<FinalProps>(gql(formQueries.fields), {
        name: 'fieldsQuery',
        skip: !isEnabled('forms'),
        options: ({ options, pipelineId }) => ({
          variables: {
            contentType: `cards:${options.type}`,
            isVisibleToCreate: true,
            pipelineId
          }
        })
      }),
      graphql<FinalProps, StagesQueryResponse>(gql(queries.stages), {
        name: 'stagesQuery',
        options: (props: FinalProps) => ({
          variables: {
            pipelineId: props.pipelineId || ''
          }
        })
      })
    )(AddFormContainer)
  );
