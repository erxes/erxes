import { IBoard } from 'modules/boards/types';
import Button from 'modules/common/components/Button';
import DataWithLoader from 'modules/common/components/DataWithLoader';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { TopHeader } from 'modules/common/styles/main';
import { IButtonMutateProps } from 'modules/common/types';
import { __ } from 'modules/common/utils';
import Sidebar from 'modules/layout/components/Sidebar';
import { SidebarList as List } from 'modules/layout/styles';
import React from 'react';
import { IOption } from '../types';
import BoardForm from './BoardForm';
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

  renderBoardForm(props) {
    return <BoardForm {...props} />;
  }

  renderSidebarHeader() {
    const { renderButton, type, options } = this.props;

    const boardName = options ? options.boardName : 'Board';

    const addBoard = (
      <Button
        btnStyle="success"
        icon="plus-circle"
        uppercase={false}
        block={true}
      >
        {`Add New ${boardName}`}
      </Button>
    );

    const content = props => {
      return this.renderBoardForm({ ...props, renderButton, type });
    };

    return (
      <TopHeader>
        <ModalTrigger
          title={`New ${boardName}`}
          trigger={addBoard}
          autoOpenKey="showBoardModal"
          content={content}
        />
      </TopHeader>
    );
  }

  render() {
    const { loading, boards, options } = this.props;

    const boardName =
      options && options.boardName ? options.boardName.toLowerCase() : 'board';

    return (
      <Sidebar wide={true} header={this.renderSidebarHeader()} full={true}>
        <DataWithLoader
          data={<List>{this.renderItems()}</List>}
          loading={loading}
          count={boards.length}
          emptyText={`${__(`There is no `)}${' '}${boardName}`}
          emptyImage="/images/actions/18.svg"
          objective={true}
        />
      </Sidebar>
    );
  }
}

export default Boards;
