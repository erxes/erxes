// tslint:disable-next-line:ordered-imports
import Button from 'modules/common/components/Button';
// tslint:disable-next-line:ordered-imports
import Icon from 'modules/common/components/Icon';
// tslint:disable-next-line:ordered-imports
import ModalTrigger from 'modules/common/components/ModalTrigger';
import Tip from 'modules/common/components/Tip';
// tslint:disable-next-line:ordered-imports
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import React from 'react';
import { Link } from 'react-router-dom';
// tslint:disable-next-line:ordered-imports
import { BoardItem } from '../../boards/styles';
import { ActionButtons } from '../../styles';
import { IBoard } from '../types';
import BoardForm from './BoardForm';

type Props = {
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
    const { board, renderButton } = this.props;

    const editTrigger = (
      <Button btnStyle="link">
        <Tip text="Edit" placement="bottom">
          <Icon icon="edit" />
        </Tip>
      </Button>
    );

    const content = props => (
      <BoardForm {...props} board={board} renderButton={renderButton} />
    );

    return (
      <ModalTrigger
        size={this.size}
        title={__('Edit')}
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
          <Tip text={__('Delete')} placement="bottom">
            <Button btnStyle="link" onClick={this.remove} icon="cancel-1" />
          </Tip>
        </ActionButtons>
      </BoardItem>
    );
  }
}

export default BoardRow;
