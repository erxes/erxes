import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Sidebar as LeftSidebar } from 'modules/layout/components';
import { DataWithLoader, ModalTrigger, Icon } from 'modules/common/components';
import { SidebarList as List } from 'modules/layout/styles';
import { RightButton } from '../../styles';
import { BoardForm, BoardRow } from './';

const propTypes = {
  boards: PropTypes.array.isRequired,
  remove: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
  setDefault: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired
};

class Boards extends Component {
  constructor(props) {
    super(props);

    this.renderItems = this.renderItems.bind(this);
  }

  renderItems() {
    const { boards, remove, save, setDefault } = this.props;

    return boards.map(board => (
      <BoardRow
        key={board._id}
        isDefault={board.isDefault}
        board={board}
        remove={remove}
        save={save}
        setDefault={setDefault}
      />
    ));
  }

  renderBoardForm(props) {
    return <BoardForm {...props} />;
  }

  renderSidebarHeader() {
    const { __ } = this.context;
    const { save } = this.props;
    const { Header } = LeftSidebar;

    const addBoard = (
      <RightButton>
        <Icon icon="plus" />
      </RightButton>
    );

    return (
      <Header uppercase bold>
        {__('Board')}
        <ModalTrigger title="New Board" trigger={addBoard}>
          {this.renderBoardForm({ save })}
        </ModalTrigger>
      </Header>
    );
  }

  render() {
    const { loading, boards } = this.props;

    return (
      <LeftSidebar full header={this.renderSidebarHeader()}>
        <DataWithLoader
          data={<List>{this.renderItems()}</List>}
          loading={loading}
          count={boards.length}
          emptyText="There is no board"
          emptyImage="/images/robots/robot-05.svg"
        />
      </LeftSidebar>
    );
  }
}

Boards.propTypes = propTypes;
Boards.contextTypes = {
  __: PropTypes.func
};

export default Boards;
