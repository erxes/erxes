import { Button, Icon, ModalTrigger, Tip } from 'modules/common/components';
import * as React from 'react';
import { Link } from 'react-router-dom';
import { ActionButtons } from '../../styles';
import { BoardItem } from '../styles';
import { IBoard } from '../types';
import { BoardForm } from './';

type Props = {
  board: IBoard,
  remove: (_id: string) => void,
  save: ({ doc }: { doc: any; }, callback: () => void, board: IBoard) => void,
};

class BoardRow extends React.Component<Props, {}> {
  private size;

  constructor(props: Props) {
    super(props);

    this.remove = this.remove.bind(this);
  }

  remove() {
    const { board } = this.props;

    this.props.remove(board._id);
  }

  renderEditAction() {
    const { board, save } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text="Edit">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    return (
      <ModalTrigger 
        size={this.size} 
        title="Edit" 
        trigger={editTrigger}
        content={(props) => {
          return this.renderEditForm({ ...props, board, save })
        }}
      />
    );
  }

  renderEditForm(props) {
    return <BoardForm {...props} />;
  }

  render() {
    const { board } = this.props;

    return (
      <BoardItem key={board._id}>
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
