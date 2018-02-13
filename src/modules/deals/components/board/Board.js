import React from 'react';
import PropTypes from 'prop-types';

import { Link } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { Wrapper } from 'modules/layout/components';
import { DragDropContext } from 'react-beautiful-dnd';

import { Pipeline } from '../';
import { moveInList, addToList, removeFromList } from '../../utils';
import { BarItems } from 'modules/layout/styles';
import { Button, DropdownToggle, Icon } from 'modules/common/components';

const propTypes = {
  currentBoard: PropTypes.object,
  boards: PropTypes.array,
  pipelines: PropTypes.array
};

class Board extends React.Component {
  constructor(props) {
    super(props);

    const deals = {};
    props.deals.forEach(deal => {
      if (deals[deal.stageId]) {
        deals[deal.stageId].push(deal);
      } else {
        deals[deal.stageId] = [deal];
      }
    });

    const stages = {};
    props.stages.forEach(stage => {
      if (stages[stage.pipelineId]) {
        stages[stage.pipelineId].push(stage);
      } else {
        stages[stage.pipelineId] = [stage];
      }
    });

    console.log('props: ', this.props);

    this.state = {
      deals,
      stages,
      showDealForm: {}
    };

    this.onDragEnd = this.onDragEnd.bind(this);
  }

  showNewDeal(stageId) {
    const showDealForm = this.state.showDealForm;
    showDealForm[stageId] = true;

    this.setState({
      showDealForm
    });
  }

  reOrder({ source, destination }, list, fieldName) {
    // If ordering within list
    if (source.droppableId === destination.droppableId) {
      // move in list
      const movedList = moveInList(
        list[destination.droppableId],
        source.index,
        destination.index
      );

      // update moved list
      list[destination.droppableId] = movedList;
    } else {
      // When move to another list
      // Remove from source list
      const { sourceArray, removedItem } = removeFromList(
        list[source.droppableId],
        source.index
      );

      // Update removed list
      list[source.droppableId] = sourceArray;

      // Change droppableId
      removedItem[fieldName] = destination.droppableId;

      // Add destination list
      const addedList = addToList(
        list[destination.droppableId],
        destination.index,
        removedItem
      );

      // Update added list
      list[destination.droppableId] = addedList;
    }
    // reordered list
    return list;
  }

  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    switch (result.type) {
      case 'DEAL': {
        const reOrderedDeals = this.reOrder(
          result,
          this.state.deals,
          'stageId'
        );

        this.setState({
          deals: reOrderedDeals
        });

        break;
      }
      case 'STAGE': {
        const reOrderedStages = this.reOrder(
          result,
          this.state.stages,
          'pipelineId'
        );

        this.setState({
          stages: reOrderedStages
        });

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
              stages={this.state.stages[pipeline._id]}
              deals={this.state.deals}
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

export default Board;
