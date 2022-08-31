import { IBoard } from '@erxes/ui-cards/src/boards/types';
import Button from '@erxes/ui/src/components/Button';
import DataWithLoader from '@erxes/ui/src/components/DataWithLoader';
import ModalTrigger from '@erxes/ui/src/components/ModalTrigger';
import { IButtonMutateProps } from '@erxes/ui/src/types';
import { __ } from '@erxes/ui/src/utils/core';
import Sidebar from '@erxes/ui/src/layout/components/Sidebar';
import { SidebarList as List } from '@erxes/ui/src/layout/styles';
import React from 'react';
import { IOption } from '../types';
import BoardForm from './BoardForm';
import BoardRow from './BoardRow';
import { Header } from '@erxes/ui-settings/src/styles';

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
      <Button btnStyle="success" icon="plus-circle" block={true}>
        Add New {boardName}
      </Button>
    );

    const content = props => {
      return this.renderBoardForm({ ...props, renderButton, type });
    };

    return (
      <Header>
        <ModalTrigger
          title={`New ${boardName}`}
          trigger={addBoard}
          autoOpenKey="showBoardModal"
          content={content}
        />
      </Header>
    );
  }

  render() {
    const { loading, boards, options } = this.props;

    const boardName =
      options && options.boardName ? options.boardName.toLowerCase() : 'board';

    return (
      <Sidebar wide header={this.renderSidebarHeader()} hasBorder>
        <DataWithLoader
          data={
            <List noTextColor noBackground>
              {this.renderItems()}
            </List>
          }
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
