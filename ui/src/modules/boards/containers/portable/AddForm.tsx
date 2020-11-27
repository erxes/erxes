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
import { mutations as boardMutations ,queries } from '../../graphql';
import { ConvertToMutationResponse, ConvertToMutationVariables, IItem, IItemParams, IOptions, SaveMutation, UpdateMutation } from '../../types';

type IProps = {
  options: IOptions;
  boardId?: string;
  pipelineId?: string;
  stageId?: string;
  showSelect?: boolean;
  relType?: string;
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
};

type FinalProps = {
  addMutation: SaveMutation;
  editMutation: UpdateMutation;
  conversationConvertToCard: ConvertToMutationResponse;
  editConformity: EditConformityMutation;
} & IProps & ConvertToMutationResponse;

class AddFormContainer extends React.Component<FinalProps> {
  saveItem = (doc: IItemParams, callback: (item: IItem) => void) => {
    const {
      // addMutation,
      // editMutation,
      conversationConvertToCard,
      options,
      relType,
      relTypeIds,
      editConformity,
      refetch,
      assignedUserIds,
      sourceConversationId,
      getAssociatedItem,
      aboveItemId,
      description,
      attachments,
    } = this.props;

    doc.assignedUserIds = assignedUserIds;
    doc.sourceConversationIds = [sourceConversationId || ""];

    const proccessId = Math.random().toString();

    localStorage.setItem('proccessId', proccessId);

    doc.proccessId = proccessId;
    doc.aboveItemId = aboveItemId;
    doc.description = description;
    doc.attachments = attachments;

    conversationConvertToCard({
      variables: {
        _id: sourceConversationId || "",
        type: options.type,
        itemId: doc._id,
        itemName: doc.name,
        stageId: doc.stageId
      },
    }).then(({ data }) => {

      if (options.texts.addSuccessText) {
        Alert.success(options.texts.addSuccessText);
      }

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

      callback(data);

      if (getAssociatedItem) {
        getAssociatedItem(data.conversationConvertToCard);
      }

      if (refetch) {
        refetch();
      }
    })
      .catch(error => {
        Alert.error(error.message);
      });
};

render() {
  const extendedProps = {
    ...this.props,
    saveItem: this.saveItem
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
      graphql<IProps, UpdateMutation, IItem>(
        gql(props.options.mutations.editMutation),
        {
          name: 'editMutation',
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
          name: 'conversationConvertToCard',
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
