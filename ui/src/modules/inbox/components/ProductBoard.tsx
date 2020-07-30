import Icon from 'modules/common/components/Icon';
import Tip from 'modules/common/components/Tip';
import { __ } from 'modules/common/utils';
import React from 'react';
import { IConversation } from '../types';

type Props = {
  conversation: IConversation;
  createBoard: (conversationId: string) => void;
};

class ProductBoard extends React.Component<Props> {
  createBoard = () => {
    const { conversation, createBoard } = this.props;
    // call change status method
    createBoard(conversation._id);
  };

  openBoard = () => {
    const { conversation } = this.props;

    window.open(`${conversation.productBoardLink}`, '_blank');
  };

  render() {
    const hasProductBoard =
      this.props.conversation.productBoardLink !== '' &&
      this.props.conversation.productBoardLink !== null;

    const tipText = hasProductBoard
      ? 'Go to product board'
      : 'Create product board note';

    return (
      <Tip text={__(tipText)}>
        <label
          onClick={
            hasProductBoard
              ? () => {
                  this.openBoard();
                }
              : () => {
                  this.createBoard();
                }
          }
        >
          {hasProductBoard ? (
            <Icon icon="file-check-alt" />
          ) : (
            <Icon icon="file-alt" />
          )}
        </label>
      </Tip>
    );
  }
}

export default ProductBoard;
