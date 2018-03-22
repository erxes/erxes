import React from 'react';
import PropTypes from 'prop-types';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import {
  StageWrapper,
  StageContainer,
  StageHeader,
  StageBody,
  StageDropZone,
  AddNewDeal
} from '../styles';
import { Icon } from 'modules/common/components';
import { Deal } from '../containers';
import { DealForm } from '../containers';

const propTypes = {
  stage: PropTypes.object.isRequired,
  boardId: PropTypes.string,
  pipelineId: PropTypes.string,
  deals: PropTypes.array,
  index: PropTypes.number.isRequired,
  saveDeal: PropTypes.func.isRequired,
  removeDeal: PropTypes.func.isRequired,
  moveDeal: PropTypes.func.isRequired
};

class Stage extends React.Component {
  constructor(props) {
    super(props);

    this.showForm = this.showForm.bind(this);
    this.closeForm = this.closeForm.bind(this);

    this.state = { show: false };
  }

  showForm() {
    this.setState({ show: true });
  }

  closeForm() {
    this.setState({ show: false });
  }

  renderAmount(amount) {
    return (
      <ul>
        {Object.keys(amount).length > 0 ? (
          Object.keys(amount).map(key => (
            <li key={key}>
              {amount[key].toLocaleString()} {key}
            </li>
          ))
        ) : (
          <li>0</li>
        )}
      </ul>
    );
  }

  renderDealForm(show) {
    if (show) {
      const { stage, pipelineId, boardId, deals } = this.props;

      return (
        <DealForm
          boardId={boardId}
          pipelineId={pipelineId}
          stageId={stage._id}
          close={this.closeForm.bind(this)}
          dealsLength={deals.length}
          saveDeal={this.props.saveDeal}
        />
      );
    }

    const { __ } = this.context;

    return (
      <AddNewDeal onClick={this.showForm.bind(this)}>
        <Icon icon="plus" /> {__('Add new deal')}
      </AddNewDeal>
    );
  }

  render() {
    const { __ } = this.context;
    const { stage, deals, index, saveDeal, removeDeal, moveDeal } = this.props;

    return (
      <Draggable draggableId={stage._id} index={index}>
        {(provided, snapshot) => {
          return (
            <StageWrapper>
              <StageContainer
                innerRef={provided.innerRef}
                {...provided.draggableProps}
                isDragging={snapshot.isDragging}
              >
                <StageHeader {...provided.dragHandleProps}>
                  <div>
                    <h3>{stage.name}</h3>
                    <span className="deals-count">
                      {__('Deal')}: {deals.length}
                    </span>
                  </div>

                  {this.renderAmount(stage.amount)}
                </StageHeader>

                <StageBody>
                  <Droppable droppableId={stage._id} type="stage">
                    {dropProvided => (
                      <StageDropZone innerRef={dropProvided.innerRef}>
                        <div>
                          {deals.map((deal, index) => (
                            <Deal
                              key={deal._id}
                              index={index}
                              dealId={deal._id}
                              saveDeal={saveDeal}
                              removeDeal={removeDeal}
                              moveDeal={moveDeal}
                            />
                          ))}
                        </div>
                        {dropProvided.placeholder}
                      </StageDropZone>
                    )}
                  </Droppable>

                  {this.renderDealForm(this.state.show)}
                </StageBody>
              </StageContainer>
            </StageWrapper>
          );
        }}
      </Draggable>
    );
  }
}

export default Stage;

Stage.propTypes = propTypes;
Stage.contextTypes = {
  __: PropTypes.func
};
