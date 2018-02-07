import React from 'react';
import { Link } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { Wrapper } from 'modules/layout/components';
import { DragDropContext } from 'react-beautiful-dnd';

import Pipeline from './pipeline';
import { Pipelines, Stages, Deals } from '../constants';
import { moveInList, addToList, removeFromList } from '../utils';
import { BarItems } from 'modules/layout/styles';
import {
  ModalTrigger,
  Button,
  DropdownToggle,
  Icon
} from 'modules/common/components';

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
    const breadcrumb = [{ title: 'Deal' }];

    const addTrigger = (
      <Button btnStyle="success" size="small" icon="plus">
        Add pipeline
      </Button>
    );

    const actionBarRight = (
      <BarItems>
        <ModalTrigger title="New pipeline" trigger={addTrigger} />
      </BarItems>
    );

    const actionBarLeft = (
      <BarItems>
        <Dropdown id="dropdown-board" pullRight>
          <DropdownToggle bsRole="toggle">
            <Button btnStyle="simple" size="small">
              Board 1 <Icon icon="ios-arrow-down" />
            </Button>
          </DropdownToggle>
          <Dropdown.Menu>
            <li>
              <Link to="/deals/board/2">Board 2</Link>
            </li>
            <li>
              <Link to="/deals/board/3">Board 3</Link>
            </li>
          </Dropdown.Menu>
        </Dropdown>
      </BarItems>
    );

    const actionBar = (
      <Wrapper.ActionBar
        left={actionBarLeft}
        right={actionBarRight}
        background="transparent"
      />
    );

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

export default Board;
