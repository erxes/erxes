import React from 'react';
import PropTypes from 'prop-types';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { StageContainer, StageBody, AddNewDeal } from '../../styles';
import { Icon } from 'modules/common/components';
import { Deal } from '../';
import { DealForm } from '../../containers';
import { listObjectUnFreeze } from 'modules/common/utils';

const propTypes = {
  stage: PropTypes.object.isRequired,
  boardId: PropTypes.string,
  pipelineId: PropTypes.string,
  deals: PropTypes.array,
  dealsFromDb: PropTypes.array,
  index: PropTypes.number.isRequired,
  addDealForm: PropTypes.func.isRequired,
  closeDealForm: PropTypes.func.isRequired,
  collectDeals: PropTypes.func.isRequired,
  refetch: PropTypes.func.isRequired,
  showDealForm: PropTypes.object.isRequired
};

class Stage extends React.Component {
  constructor(props) {
    super(props);

    let amount = 0;

    props.deals.forEach(deal => {
      amount += deal.amount;
    });

    props.collectDeals(props.stage._id, listObjectUnFreeze(props.dealsFromDb));

    this.state = {
      amount
    };
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.dealsFromDb.length !== nextProps.dealsFromDb.length) {
      this.props.collectDeals(
        this.props.stage._id,
        listObjectUnFreeze(nextProps.dealsFromDb)
      );
    }
  }

  render() {
    const { stage, pipelineId, boardId, deals, index } = this.props;
    const { amount } = this.state;

    return (
      <Draggable draggableId={stage._id} index={index}>
        {(provided, snapshot) => {
          return (
            <StageContainer
              innerRef={provided.innerRef}
              {...provided.draggableProps}
              isDragging={snapshot.isDragging}
            >
              <h3 {...provided.dragHandleProps}>
                {stage.name} {amount}
              </h3>
              <Droppable droppableId={stage._id} type="DEAL">
                {dropProvided => (
                  <StageBody innerRef={dropProvided.innerRef}>
                    <div>
                      {deals.map((deal, i) => (
                        <Deal key={deal._id} deal={deal} index={i} />
                      ))}
                    </div>
                    {dropProvided.placeholder}
                  </StageBody>
                )}
              </Droppable>
              {this.props.showDealForm[stage._id] ? (
                <DealForm
                  boardId={boardId}
                  pipelineId={pipelineId}
                  stageId={stage._id}
                  refetch={this.props.refetch}
                  close={this.props.closeDealForm.bind(this, stage._id)}
                  deals={this.props.deals}
                />
              ) : (
                <AddNewDeal
                  onClick={this.props.addDealForm.bind(this, stage._id)}
                >
                  <Icon icon="plus" /> Add new deal
                </AddNewDeal>
              )}
            </StageContainer>
          );
        }}
      </Draggable>
    );
  }
}

export default Stage;

Stage.propTypes = propTypes;
