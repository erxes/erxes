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

    this.state = {
      dealsByStage: {},
      stagesByPipeline: {},

      dealResult: {}
    };

    this.addToDeals = this.addToDeals.bind(this);
    this.collectDeals = this.collectDeals.bind(this);
    this.collectStages = this.collectStages.bind(this);
    this.onDragEnd = this.onDragEnd.bind(this);
  }

  addToDeals(stageId, deal) {
    const dealsByStage = this.state.dealsByStage;

    const deals = dealsByStage[stageId] || [];
    deals.push(deal);

    dealsByStage[stageId] = deals;

    this.setState({
      dealsByStage
    });
  }

  collectDeals(stageId, deals) {
    const dealsByStage = this.state.dealsByStage;
    dealsByStage[stageId] = deals;

    this.setState({
      dealsByStage
    });
  }

  collectStages(pipelineId, stages) {
    const stagesByPipeline = this.state.stagesByPipeline;
    stagesByPipeline[pipelineId] = stages;

    this.setState({
      stagesByPipeline
    });
  }

  onDragEnd(result) {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    switch (result.type) {
      case 'DEAL': {
        this.setState({
          dealResult: result
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
              collectStages={this.collectStages}
              collectDeals={this.collectDeals}
              addToDeals={this.addToDeals}
              dealResult={this.state.dealResult}
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
