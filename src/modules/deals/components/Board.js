import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { Wrapper } from 'modules/layout/components';
import { DragDropContext } from 'react-beautiful-dnd';

import { Pipeline } from '../containers';
import { BarItems } from 'modules/layout/styles';
import { Button, DropdownToggle, Icon } from 'modules/common/components';

const propTypes = {
  currentBoard: PropTypes.object,
  boards: PropTypes.array,
  pipelines: PropTypes.array,
  onDragEnd: PropTypes.func,
  states: PropTypes.object
};

class Board extends React.Component {
  constructor(props) {
    super(props);

    this.renderBoard = this.renderBoard.bind(this);
    this.renderPipeline = this.renderPipeline.bind(this);
  }

  renderBoard() {
    const { currentBoard, boards } = this.props;

    return boards.map(board => {
      if (board._id !== currentBoard._id) {
        return (
          <li key={board._id}>
            <Link to={`/deals/board?id=${board._id}`}>{board.name}</Link>
          </li>
        );
      }

      return null;
    });
  }

  renderPipeline() {
    const { states, pipelines, currentBoard } = this.props;

    const stageStates = {};

    Object.keys(states).forEach(key => {
      if (key.startsWith('stageState')) {
        stageStates[key] = states[key];
      }
    });

    return pipelines.map(pipeline => (
      <Pipeline
        key={pipeline._id}
        {...stageStates}
        state={states[`pipelineState${pipeline._id}`]}
        pipeline={pipeline}
        boardId={currentBoard._id}
      />
    ));
  }

  render() {
    const { __ } = this.context;
    const breadcrumb = [{ title: __('Deal') }];

    const { currentBoard, onDragEnd } = this.props;

    const actionBarLeft = (
      <BarItems>
        <Dropdown id="dropdown-board">
          <DropdownToggle bsRole="toggle">
            <Button btnStyle="simple" size="small">
              {currentBoard.name} <Icon icon="ios-arrow-down" />
            </Button>
          </DropdownToggle>

          <Dropdown.Menu>{this.renderBoard()}</Dropdown.Menu>
        </Dropdown>
      </BarItems>
    );

    const actionBar = (
      <Wrapper.ActionBar left={actionBarLeft} background="transparent" />
    );

    const content = (
      <DragDropContext onDragEnd={onDragEnd}>
        {this.renderPipeline()}
      </DragDropContext>
    );

    return (
      <Wrapper
        header={<Wrapper.Header breadcrumb={breadcrumb} />}
        actionBar={actionBar}
        content={content}
        transparent
      />
    );
  }
}

Board.propTypes = propTypes;
Board.contextTypes = {
  __: PropTypes.func
};

export default Board;
