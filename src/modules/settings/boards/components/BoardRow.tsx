import { Button, Icon, ModalTrigger, Tip } from 'modules/common/components';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { BoardForm } from '.';
import { ActionButtons } from '../../styles';
import { BoardItem } from '../styles';
import { IBoard } from '../types';

type Props = {
  type: string;
  board: IBoard;
  remove: (boardId: string) => void;
  save: (
    params: { doc: { name: string } },
    callback: () => void,
    brand: IBoard
  ) => void;
  isActive: boolean;
};

class BoardRow extends React.Component<Props, {}> {
  private size;

  remove = () => {
    const { board } = this.props;

    this.props.remove(board._id);
  };

  renderEditAction() {
    const { board, save, type } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text="Edit">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    const content = props => (
      <BoardForm {...props} board={board} save={save} type={type} />
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
          <Tip text="Delete">
            <Button btnStyle="link" onClick={this.remove} icon="cancel-1" />
          </Tip>
        </ActionButtons>
      </BoardItem>
    );
  }
}

export default BoardRow;
