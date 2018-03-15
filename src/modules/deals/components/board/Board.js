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
import { listObjectUnFreeze } from 'modules/common/utils';

const propTypes = {
  currentBoard: PropTypes.object,
  boards: PropTypes.array,
  pipelines: PropTypes.array,
  stages: PropTypes.array,
  dealsRefetch: PropTypes.func,
  deals: PropTypes.array,
  dealsUpdateOrder: PropTypes.func,
  stagesUpdateOrder: PropTypes.func,
  dealsChange: PropTypes.func,
  stagesChange: PropTypes.func
};

class Board extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      dealsByStage: this.collectDeals(listObjectUnFreeze(props.deals)),
      stagesByPipeline: this.collectStages(listObjectUnFreeze(props.stages))
    };

    this.onDragEnd = this.onDragEnd.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (JSON.stringify(this.props.deals) !== JSON.stringify(nextProps.deals)) {
      this.setState({
        dealsByStage: this.collectDeals(listObjectUnFreeze(nextProps.deals))
      });
    }

    if (
      JSON.stringify(this.props.stages) !== JSON.stringify(nextProps.stages)
    ) {
      this.setState({
        stagesByPipeline: this.collectStages(
          listObjectUnFreeze(nextProps.stages)
        )
      });
    }
  }

  collectDeals(deals) {
    const dealsByStage = {};

    deals.forEach(el => {
      if (dealsByStage[el.stageId]) {
        dealsByStage[el.stageId].push(el);
      } else {
        dealsByStage[el.stageId] = [el];
      }
    });

    return dealsByStage;
  }

  collectStages(stages) {
    const stagesByPipeline = {};

    stages.forEach(el => {
      if (stagesByPipeline[el.pipelineId]) {
        stagesByPipeline[el.pipelineId].push(el);
      } else {
        stagesByPipeline[el.pipelineId] = [el];
      }
    });

    return stagesByPipeline;
  }

  collectOrders(list) {
    const updatedList = [];

    list.forEach((element, index) => {
      updatedList.push({
        _id: element._id,
        order: index
      });
    });

    return updatedList;
  }

  reOrder(
    { type, source, destination, draggableId },
    list,
    updateOrder,
    change
  ) {
    // If ordering within list
    if (source.droppableId === destination.droppableId) {
      // move in list
      const reOrderedList = moveInList(
        list[destination.droppableId],
        source.index,
        destination.index
      );

      updateOrder(this.collectOrders(reOrderedList));

      // update reordered list
      list[destination.droppableId] = reOrderedList;

      return list;
    }

    // When move to another list
    // Remove from source list
    const { sourceList, removedItem } = removeFromList(
      list[source.droppableId],
      source.index
    );

    // Update source list
    list[source.droppableId] = sourceList;

    // Add destination list
    const destinationList = addToList(
      list[destination.droppableId],
      destination.index,
      removedItem
    );

    // Update destination list
    list[destination.droppableId] = destinationList;

    updateOrder(this.collectOrders(sourceList));
    updateOrder(this.collectOrders(destinationList));

    if (type === 'DEAL') {
      const deal = list[destination.droppableId].find(
        el => el._id === draggableId
      );

      removedItem.stageId = destination.droppableId;

      change(draggableId, destination.droppableId, deal.pipelineId);
    } else {
      removedItem.pipelineId = destination.droppableId;

      change(draggableId, destination.droppableId);
    }

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
          this.state.dealsByStage,
          this.props.dealsUpdateOrder,
          this.props.dealsChange
        );

        this.setState({
          dealsByStage: reOrderedDeals
        });

        break;
      }
      case 'STAGE': {
        const reOrderedStages = this.reOrder(
          result,
          this.state.stagesByPipeline,
          this.props.stagesUpdateOrder,
          this.props.stagesChange
        );

        this.setState({
          stagesByPipeline: reOrderedStages
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
              boardId={currentBoard._id}
              stages={this.state.stagesByPipeline[pipeline._id] || []}
              dealsByStage={this.state.dealsByStage}
              dealsRefetch={this.props.dealsRefetch}
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
