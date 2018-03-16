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
} from '../../styles';
import { Icon } from 'modules/common/components';
import { Deal } from '../';
import { DealForm } from '../../containers';

const propTypes = {
  stage: PropTypes.object.isRequired,
  boardId: PropTypes.string,
  pipelineId: PropTypes.string,
  deals: PropTypes.array,
  index: PropTypes.number.isRequired,
  saveDeal: PropTypes.func.isRequired
};

class Stage extends React.Component {
  constructor(props) {
    super(props);

    this.showForm = this.showForm.bind(this);
    this.closeForm = this.closeForm.bind(this);

    this.state = {
      amount: {},
      show: false
    };
  }

  showForm() {
    this.setState({
      show: true
    });
  }

  closeForm() {
    this.setState({
      show: false
    });
  }

  componentWillReceiveProps(nextProps) {
    const amount = {};

    if (nextProps.deals.length > 0) {
      nextProps.deals.forEach(deal => {
        Object.keys(deal.amount).forEach(key => {
          if (!amount[key]) amount[key] = deal.amount[key];
          else amount[key] += deal.amount[key];
        });
      });
    }

    this.setState({ amount });
  }

  render() {
    const { stage, pipelineId, boardId, deals, saveDeal } = this.props;

    const amount = this.state.amount;

    return (
      <Draggable draggableId={stage._id} index={this.props.index}>
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
                    <span className="deals-count">Deal: {deals.length}</span>
                  </div>
                  {Object.keys(amount).length > 0 ? (
                    <ul>
                      {Object.keys(amount).map(key => (
                        <li key={key}>
                          {amount[key].toLocaleString()} {key}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <ul>
                      <li>0</li>
                    </ul>
                  )}
                </StageHeader>
                <StageBody>
                  <Droppable droppableId={stage._id} type="DEAL">
                    {dropProvided => (
                      <StageDropZone innerRef={dropProvided.innerRef}>
                        <div>
                          {deals.map((deal, index) => (
                            <Deal
                              key={deal._id}
                              deal={deal}
                              index={index}
                              saveDeal={saveDeal}
                            />
                          ))}
                        </div>
                        {dropProvided.placeholder}
                      </StageDropZone>
                    )}
                  </Droppable>
                  {this.state.show ? (
                    <DealForm
                      boardId={boardId}
                      pipelineId={pipelineId}
                      stageId={stage._id}
                      close={this.closeForm.bind(this)}
                      dealsLength={deals.length}
                      saveDeal={saveDeal}
                    />
                  ) : (
                    <AddNewDeal onClick={this.showForm.bind(this)}>
                      <Icon icon="plus" /> Add new deal
                    </AddNewDeal>
                  )}
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
