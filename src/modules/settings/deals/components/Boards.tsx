import { DataWithLoader, Icon, ModalTrigger } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { Sidebar } from 'modules/layout/components';
import { HelperButtons, SidebarList as List } from 'modules/layout/styles';
import * as React from 'react';
import { IBoard } from '../types';
import { BoardForm, BoardRow } from './';

type Props = {
  boards: IBoard[];
  remove: (_id: string) => void;
  save: (
    params: { doc: { name: string } },
    callback: () => void,
    brand: IBoard
  ) => void;
  loading: boolean;
};

class Boards extends React.Component<Props, {}> {
  constructor(props) {
    super(props);

    this.renderItems = this.renderItems.bind(this);
  }

  renderItems() {
    const { boards, remove, save } = this.props;

    return boards.map(board => (
      <BoardRow key={board._id} board={board} remove={remove} save={save} />
    ));
  }

  renderBoardForm(props) {
    return <BoardForm {...props} />;
  }

  renderSidebarHeader() {
    const { save } = this.props;
    const { Header } = Sidebar;

    const addBoard = (
      <HelperButtons>
        <a>
          <Icon icon="add" />
        </a>
      </HelperButtons>
    );

    return (
      <Header uppercase>
        {__('Board')}

        <ModalTrigger
          title="New Board"
          trigger={addBoard}
          content={props => {
            return this.renderBoardForm({ ...props, save });
          }}
        />
      </Header>
    );
  }

  render() {
    const { loading, boards } = this.props;

    return (
      <Sidebar header={this.renderSidebarHeader()}>
        <Sidebar.Section>
          <DataWithLoader
            data={<List>{this.renderItems()}</List>}
            loading={loading}
            count={boards.length}
            emptyText="There is no board"
            emptyImage="/images/robots/robot-05.svg"
            objective
          />
        </Sidebar.Section>
      </Sidebar>
    );
  }
}

export default Boards;
