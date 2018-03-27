import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { BoardForm } from './';
import { ModalTrigger, Tip, Button, Icon } from 'modules/common/components';
import { SidebarListItem, ActionButtons } from '../../styles';
import { BoardRowContainer } from '../styles';

const propTypes = {
  board: PropTypes.object.isRequired,
  remove: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired,
  select: PropTypes.func.isRequired,
  selected: PropTypes.bool
};

class BoardRow extends Component {
  constructor(props) {
    super(props);

    this.remove = this.remove.bind(this);
    this.star = this.star.bind(this);
  }

  remove() {
    const { board } = this.props;

    this.props.remove(board._id);
  }

  star() {
    const { board } = this.props;

    this.props.select(board._id);
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
    const { board, selected } = this.props;

    return (
      <BoardRowContainer selected={selected}>
        <SidebarListItem key={board._id}>
          <Button btnStyle="link" onClick={this.star} icon="star" />
          <Link to={`?boardId=${board._id}`}>{board.name}</Link>
          <ActionButtons>
            {this.renderEditAction()}
            <Tip text="Delete">
              <Button btnStyle="link" onClick={this.remove} icon="close" />
            </Tip>
          </ActionButtons>
        </SidebarListItem>
      </BoardRowContainer>
    );
  }
}

BoardRow.propTypes = propTypes;

export default BoardRow;
