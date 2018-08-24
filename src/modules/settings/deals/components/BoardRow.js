import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { BoardForm } from './';
import { ModalTrigger, Tip, Button, Icon } from 'modules/common/components';
import { ActionButtons } from '../../styles';
import { BoardItem } from '../styles';

const propTypes = {
  board: PropTypes.object.isRequired,
  remove: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired
};

class BoardRow extends Component {
  constructor(props) {
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
      <ModalTrigger size={this.size} title="Edit" trigger={editTrigger}>
        {this.renderEditForm({ board, save })}
      </ModalTrigger>
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

BoardRow.propTypes = propTypes;

export default BoardRow;
