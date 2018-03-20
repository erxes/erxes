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
  stages: PropTypes.array,
  stagesUpdateOrder: PropTypes.func,
  stagesChange: PropTypes.func
};

class Board extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};

    this.move = this.move.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  getChildContext() {
    return {
      move: this.move
    };
  }

  move({ source, destination, itemId, type }) {
    this.setState({
      // remove from list
      [`${type}State${source._id}`]: {
        type: 'removeItem',
        index: source.index
      }
    });

    this.setState({
      // add to list
      [`${type}State${destination._id}`]: {
        type: 'addItem',
        index: destination.index,
        itemId
      }
    });
  }

  onDragEnd(result) {
    const { type, destination, source, draggableId } = result;

    // dropped outside the list
    if (!destination) {
      return;
    }

    this.move({
      source: { _id: source.droppableId, index: source.index },
      destination: { _id: destination.droppableId, index: destination.index },
      itemId: draggableId,
      type
    });
  }

  render() {
    const breadcrumb = [{ title: 'Deal' }];
    const { currentBoard, boards } = this.props;

    const actionBarLeft = (
      <BarItems>
        <Dropdown id="dropdown-board" pullRight>
          <DropdownToggle bsRole="toggle">
            <Button btnStyle="simple" size="small">
              {currentBoard.name} <Icon icon="ios-arrow-down" />
            </Button>
          </DropdownToggle>
          <Dropdown.Menu>
            {boards.map(board => {
              if (board._id !== currentBoard._id) {
                return (
                  <li key={board._id}>
                    <Link to={`/deals/board?id=${board._id}`}>
                      {board.name}
                    </Link>
                  </li>
                );
              }
              return null;
            })}
          </Dropdown.Menu>
        </Dropdown>
      </BarItems>
    );

    const actionBar = (
      <Wrapper.ActionBar left={actionBarLeft} background="transparent" />
    );

    const { pipelines } = this.props;

    const stageStates = {};

    Object.keys(this.state).forEach(key => {
      if (key.startsWith('stageState')) {
        stageStates[key] = this.state[key];
      }
    });

    const content = (
      <DragDropContext onDragEnd={this.onDragEnd}>
        {pipelines.map(pipeline => {
          return (
            <Pipeline
              key={pipeline._id}
              {...stageStates}
              state={this.state[`pipelineState${pipeline._id}`]}
              pipeline={pipeline}
              boardId={currentBoard._id}
            />
          );
        })}
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
Board.childContextTypes = {
  move: PropTypes.func
};

export default Board;
