import React from 'react';
import { DragDropContext } from 'react-beautiful-dnd';

import Pipeline from './pipeline';
import { Pipelines, Stages, Deals } from '../constants';
import { reOrderList, addToList, removeFromList } from '../utils';

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

    this.state = {
      deals
    };

    this.onDragEnd = this.onDragEnd.bind(this);
  }

  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const deals = this.state.deals;

    const destinationDroppableId = result.destination.droppableId;
    const sourceDroppableId = result.source.droppableId;

    // If ordering inner stage
    if (destinationDroppableId === sourceDroppableId) {
      // Reordering stage
      const reOrderedList = reOrderList(
        deals[destinationDroppableId],
        result.source.index,
        result.destination.index
      );

      deals[destinationDroppableId] = reOrderedList;
    } else {
      // When move to another stage
      // Remove source stage
      const { sourceArray, removedItem } = removeFromList(
        deals[sourceDroppableId],
        result.source.index
      );

      // Update deals state
      deals[sourceDroppableId] = sourceArray;

      // Change stageId
      removedItem.stageId = destinationDroppableId;

      // Add destination stage
      const addedList = addToList(
        deals[destinationDroppableId],
        result.destination.index,
        removedItem
      );

      // Update deals state
      deals[destinationDroppableId] = addedList;
    }

    this.setState({
      deals
    });
  }

  render() {
    return (
      <DragDropContext onDragEnd={this.onDragEnd}>
        {Pipelines.map(pipeline => {
          const stages = Stages.filter(
            stage => pipeline._id === stage.pipelineId
          );
          return (
            <Pipeline
              key={pipeline._id}
              pipeline={pipeline}
              stages={stages}
              deals={this.state.deals}
            />
          );
        })}
      </DragDropContext>
    );
  }
}

export default Board;
