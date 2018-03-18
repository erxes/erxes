import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { BoardForm } from './';
import { ModalTrigger, Tip, Button, Icon } from 'modules/common/components';
import { SidebarListItem, ActionButtons } from 'modules/settings/styles';

const propTypes = {
  board: PropTypes.object.isRequired,
  remove: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
  isActive: PropTypes.bool
};

class BoardRow extends Component {
  constructor(props) {
    super(props);

    this.renderEditForm = this.renderEditForm.bind(this);
    this.remove = this.remove.bind(this);
    this.renderEditAction = this.renderEditAction.bind(this);
  }

  remove() {
    const { remove, board } = this.props;
    remove(board._id);
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
      <ModalTrigger size={this.size} title="Edit" trigger={editTrigger}>
        {this.renderEditForm({ board, save })}
      </ModalTrigger>
    );
  }

  renderEditForm(props) {
    return <BoardForm {...props} />;
  }

  render() {
    const { board, isActive } = this.props;

    return (
      <SidebarListItem key={board._id} isActive={isActive}>
        <Link to={`?boardId=${board._id}`}>{board.name}</Link>
        <ActionButtons>
          {this.renderEditAction()}
          <Tip text="Delete">
            <Button btnStyle="link" onClick={this.remove} icon="close" />
          </Tip>
        </ActionButtons>
      </SidebarListItem>
    );
  }
}

BoardRow.propTypes = propTypes;

export default BoardRow;
