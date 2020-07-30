import gql from 'graphql-tag';
import * as compose from 'lodash.flowright';
import { Alert, withProps } from 'modules/common/utils';
import React from 'react';
import { graphql } from 'react-apollo';
import ProductBoard from '../components/ProductBoard';
import { mutations } from '../graphql';
import {
  CreateProductBoardMutationResponse,
  CreateProductBoardMutationVariables,
  IConversation
} from '../types';
import { refetchSidebarConversationsOptions } from '../utils';
import { InboxManagementActionConsumer } from './Inbox';

type Props = {
  conversation: IConversation;
};

type FinalProps = Props & CreateProductBoardMutationResponse;

const ResolverContainer = (props: FinalProps) => {
  const { createProductBoardMutation, conversation } = props;

  // create product board note from conversation
  const createBoard = notifyHandler => (conversationId: string) => {
    createProductBoardMutation({ variables: { _id: conversationId } })
      .then(() => {
        if (notifyHandler) {
          notifyHandler();
        }

        if (conversation.productBoardLink !== '') {
          Alert.info('Already created product board');
        } else {
          Alert.success('Created product board note');
        }
      })
      .catch(e => {
        Alert.error(e.message);
      });
  };

  const updatedProps = {
    ...props
  };

  return (
    <InboxManagementActionConsumer>
      {({ notifyConsumersOfManagementAction }) => (
        <ProductBoard
          {...updatedProps}
          createBoard={createBoard(notifyConsumersOfManagementAction)}
        />
      )}
    </InboxManagementActionConsumer>
  );
};

export default withProps<Props>(
  compose(
    graphql<
      Props,
      CreateProductBoardMutationResponse,
      CreateProductBoardMutationVariables
    >(gql(mutations.createProductBoardNote), {
      name: 'createProductBoardMutation',
      options: () => refetchSidebarConversationsOptions()
    })
  )(ResolverContainer)
);
