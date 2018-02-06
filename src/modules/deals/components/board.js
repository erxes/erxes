import React from 'react';
import { DragDropContext } from 'react-beautiful-dnd';

import Pipeline from './pipeline';
import { Pipelines, Stages, Deals } from '../constants';
import { moveInList, addToList, removeFromList } from '../utils';

class Board extends React.Component {
  constructor(props) {
    super(props);

    const deals = {};
    Deals.forEach(deal => {
      if (deals[deal.stageId]) {
        deals[deal.stageId].push(deal);
      } else {
        deals[deal.stageId] = [deal];
      }
    });

    const stages = {};
    Stages.forEach(stage => {
      if (stages[stage.pipelineId]) {
        stages[stage.pipelineId].push(stage);
      } else {
        stages[stage.pipelineId] = [stage];
      }
    });

    this.state = {
      deals,
      stages
    };

    this.onDragEnd = this.onDragEnd.bind(this);
  }

  reOrder({ destination, source }, list, fieldName) {
    // If ordering within list
    if (destination.droppableId === source.droppableId) {
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
    const content = (
      <DragDropContext onDragEnd={this.onDragEnd}>
        {Pipelines.map(pipeline => {
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

    return content;
  }
}

export default Board;
