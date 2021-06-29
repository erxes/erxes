import { IBoard } from 'modules/boards/types';
import Button from 'modules/common/components/Button';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Tip from 'modules/common/components/Tip';
import { IButtonMutateProps } from 'modules/common/types';
import React from 'react';
import { Link } from 'react-router-dom';
import { ActionButtons } from '../../styles';
import { BoardItem } from '../styles';
import BoardForm from './BoardForm';

type Props = {
  type: string;
  board: IBoard;
  remove: (boardId: string) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  isActive: boolean;
};

class BoardRow extends React.Component<Props, {}> {
  private size;

  remove = () => {
    const { board } = this.props;

    this.props.remove(board._id);
  };

  renderEditAction() {
    const { board, renderButton, type } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text="Edit" placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    const content = props => (
      <BoardForm
        {...props}
        board={board}
        renderButton={renderButton}
        type={type}
      />
    );

    return (
      <ModalTrigger
        size={this.size}
        title="Edit"
        trigger={editTrigger}
        content={content}
      />
    );
  }

  render() {
    const { board, isActive } = this.props;

    return (
      <BoardItem key={board._id} isActive={isActive}>
        <Link to={`?boardId=${board._id}`}>{board.name}</Link>
        <ActionButtons>
          {this.renderEditAction()}
          <Tip text="Delete" placement="bottom">
            <Button btnStyle="link" onClick={this.remove} icon="cancel-1" />
          </Tip>
        </ActionButtons>
      </BoardItem>
    );
  }
}

export default BoardRow;
