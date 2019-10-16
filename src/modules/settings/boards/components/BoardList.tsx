import { IBoard } from 'modules/boards/types';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import { SidebarList as List } from 'modules/layout/styles';
import React from 'react';
import { IOption } from '../types';
import BoardRow from './BoardRow';

type Props = {
  currentBoardId?: string;
  type: string;
  boards: IBoard[];
  remove: (boardId: string) => void;
  renderButton: (props: IButtonMutateProps) => JSX.Element;
  loading: boolean;
  options?: IOption;
};

class Boards extends React.Component<Props, {}> {
  renderItems = () => {
    const { type, boards, remove, renderButton, currentBoardId } = this.props;

    return boards.map(board => (
      <BoardRow
        type={type}
        key={board._id}
        isActive={currentBoardId === board._id}
        board={board}
        remove={remove}
        renderButton={renderButton}
      />
    ));
  };

  render() {
    const { loading, boards, options } = this.props;

    const boardName =
      options && options.boardName ? options.boardName.toLowerCase() : 'board';

    return (
      <DataWithLoader
        data={<List>{this.renderItems()}</List>}
        loading={loading}
        count={boards.length}
        emptyText={`There is no ${boardName}`}
        emptyImage="/images/actions/18.svg"
        objective={true}
      />
    );
  }
}

export default Boards;
