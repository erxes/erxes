import React from 'react';
import PropTypes from 'prop-types';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import {
  StageWrapper,
  StageContainer,
  StageHeader,
  StageAmount,
  StageBody,
  StageDropZone,
  AddNewDeal,
  Indicator,
  IndicatorItem
} from '../styles';
import { Icon } from 'modules/common/components';
import { Deal } from '../containers';
import { DealForm } from '../containers';

const propTypes = {
  stage: PropTypes.object.isRequired,
  deals: PropTypes.array,
  index: PropTypes.number.isRequired,
  length: PropTypes.number.isRequired,
  saveDeal: PropTypes.func.isRequired,
  removeDeal: PropTypes.func.isRequired,
  moveDeal: PropTypes.func.isRequired
};

class Stage extends React.Component {
  constructor(props) {
    super(props);

    this.toggleForm = this.toggleForm.bind(this);

    this.state = { show: false };
  }

  renderIndicator() {
    const { length, index } = this.props;

    return Array(length)
      .fill()
      .map((e, i) => <IndicatorItem isPass={index >= i} key={i} />);
  }

  toggleForm() {
    this.setState({ show: !this.state.show });
  }

  renderAmount(amount) {
    if (Object.keys(amount).length === 0) return <li>0</li>;

    return Object.keys(amount).map(key => (
      <li key={key}>
        {amount[key].toLocaleString()} <span>{key}</span>
      </li>
    ));
  }

  renderDealForm() {
    if (this.state.show) {
      const { stage, deals } = this.props;

      return (
        <DealForm
          stageId={stage._id}
          close={this.toggleForm}
          dealsLength={deals.length}
          saveDeal={this.props.saveDeal}
          scrollBottom={this.scrollBottom}
        />
      );
    }

    const { __ } = this.context;

    return (
      <AddNewDeal onClick={this.toggleForm}>
        <Icon icon="plus" /> {__('Add a deal')}
      </AddNewDeal>
    );
  }

  renderDeal(provided) {
    const { deals, saveDeal, removeDeal, moveDeal } = this.props;

    return (
      <StageDropZone innerRef={provided.innerRef}>
        <div className="deals">
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
        {provided.placeholder}
        {this.renderDealForm()}
      </StageDropZone>
    );
  }

  render() {
    const { stage, deals, index } = this.props;

    return (
      <Draggable draggableId={stage._id} index={index}>
        {(provided, snapshot) => (
          <StageWrapper>
            <StageContainer
              innerRef={provided.innerRef}
              {...provided.draggableProps}
              isDragging={snapshot.isDragging}
            >
              <StageHeader {...provided.dragHandleProps}>
                <h3>
                  {stage.name}
                  <span>({deals.length})</span>
                </h3>
                <StageAmount>{this.renderAmount(stage.amount)}</StageAmount>
                <Indicator>{this.renderIndicator()}</Indicator>
              </StageHeader>

              <StageBody>
                <Droppable droppableId={stage._id} type="stage">
                  {dropProvided => this.renderDeal(dropProvided)}
                </Droppable>
              </StageBody>
            </StageContainer>
          </StageWrapper>
        )}
      </Draggable>
    );
  }
}

export default Stage;

Stage.propTypes = propTypes;
Stage.contextTypes = {
  __: PropTypes.func
};
