import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { Wrapper } from 'modules/layout/components';
import { DragDropContext } from 'react-beautiful-dnd';

import { Pipeline } from '../../containers';
import { BarItems } from 'modules/layout/styles';
import { Button, DropdownToggle, Icon } from 'modules/common/components';

const propTypes = {
  currentBoard: PropTypes.object,
  boards: PropTypes.array,
  pipelines: PropTypes.array,
  stages: PropTypes.array,
  dealsRefetch: PropTypes.func,
  deals: PropTypes.array,
  dealsUpdateOrder: PropTypes.func,
  stagesUpdateOrder: PropTypes.func
};

const childContextTypes = {
  dealsChange: PropTypes.object.isRequired
};

class Board extends React.Component {
  constructor(props) {
    super(props);

    this.onDragEnd = this.onDragEnd.bind(this);

    this.state = {
      dealsChange: {}
    };
  }

  getChildContext() {
    return {
      dealsChange: this.state.dealsChange
    };
  }

  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const { draggableId, source, destination } = result;

    switch (result.type) {
      case 'DEAL': {
        this.props.dealsUpdateOrder(
          draggableId,
          { _id: source.droppableId, order: source.index },
          { _id: destination.droppableId, order: destination.index },
          () => {
            const dealsChange = {};

            dealsChange[destination.droppableId] = true;

            if (source.draggableId !== destination.draggableId) {
              dealsChange[source.droppableId] = true;
            }

            this.setState({
              dealsChange
            });
          }
        );

        break;
      }
      case 'STAGE': {
        this.props.stagesUpdateOrder(
          draggableId,
          { _id: source.droppableId, order: source.index },
          { _id: destination.droppableId, order: destination.index }
        );

        break;
      }
      default:
    }
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

    const content = (
      <DragDropContext onDragEnd={this.onDragEnd}>
        {pipelines.map(pipeline => {
          return (
            <Pipeline
              key={pipeline._id}
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
Board.childContextTypes = childContextTypes;

export default Board;
