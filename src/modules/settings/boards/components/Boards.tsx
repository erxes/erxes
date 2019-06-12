import { DataWithLoader, Icon, ModalTrigger } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Sidebar } from 'modules/layout/components';
import { HelperButtons, SidebarList as List } from 'modules/layout/styles';
import * as React from 'react';
import { BoardForm, BoardRow } from '.';
import { IBoard } from '../types';

type Props = {
  currentBoardId?: string;
  type: string;
  boards: IBoard[];
  remove: (boardId: string) => void;
  save: (
    params: { doc: { name: string } },
    callback: () => void,
    brand: IBoard
  ) => void;
  loading: boolean;
};

class Boards extends React.Component<Props, {}> {
  renderItems = () => {
    const { boards, remove, save, currentBoardId } = this.props;

    return boards.map(board => (
      <BoardRow
        key={board._id}
        isActive={currentBoardId === board._id}
        board={board}
        remove={remove}
        save={save}
      />
    ));
  };

  renderBoardForm(props) {
    return <BoardForm {...props} />;
  }

  renderSidebarHeader() {
    const { save, type } = this.props;
    const { Header } = Sidebar;

    const addBoard = (
      <HelperButtons>
        <a>
          <Icon icon="add" />
        </a>
      </HelperButtons>
    );

    const content = props => {
      return this.renderBoardForm({ ...props, save, type });
    };

    return (
      <Header uppercase={true}>
        {__('Board')}

        <ModalTrigger title="New Board" trigger={addBoard} content={content} />
      </Header>
    );
  }

  render() {
    const { loading, boards } = this.props;

    return (
      <Sidebar wide={true} header={this.renderSidebarHeader()} full={true}>
        <DataWithLoader
          data={<List>{this.renderItems()}</List>}
          loading={loading}
          count={boards.length}
          emptyText="There is no board"
          emptyImage="/images/actions/18.svg"
          objective={true}
        />
      </Sidebar>
    );
  }
}

export default Boards;
