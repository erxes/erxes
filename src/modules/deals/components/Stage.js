import React from 'react';
import PropTypes from 'prop-types';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { Icon, ModalTrigger } from 'modules/common/components';
import { Deal } from '../containers';
import { DealAddForm } from './';
import { AddNew } from '../styles/deal';
import {
  Wrapper,
  Container,
  Header,
  Body,
  Amount,
  Indicator,
  IndicatorItem,
  DropZone
} from '../styles/stage';

const propTypes = {
  stage: PropTypes.object.isRequired,
  deals: PropTypes.array,
  index: PropTypes.number,
  length: PropTypes.number,
  saveDeal: PropTypes.func,
  removeDeal: PropTypes.func,
  stageId: PropTypes.string
};

const defaultProps = {
  deals: []
};

class Stage extends React.Component {
  renderAmount(amount) {
    if (Object.keys(amount).length === 0) return <li>0</li>;

    return Object.keys(amount).map(key => (
      <li key={key}>
        {amount[key].toLocaleString()} <span>{key}</span>
      </li>
    ));
  }

  showDealForm() {
    const { __ } = this.context;
    const { stage, saveDeal } = this.props;

    const trigger = (
      <AddNew>
        <Icon icon="add" /> {__('Add a deal')}
      </AddNew>
    );

    return (
      <ModalTrigger title="Add a deal" trigger={trigger}>
        <DealAddForm stageId={stage._id} saveDeal={saveDeal} />
      </ModalTrigger>
    );
  }

  renderIndicator() {
    const { length, index } = this.props;

    return Array(length)
      .fill()
      .map((e, i) => <IndicatorItem isPass={index >= i} key={i} />);
  }

  renderDeal(provided) {
    const { deals, saveDeal, removeDeal } = this.props;

    return (
      <DropZone innerRef={provided.innerRef}>
        <div className="deals">
          {deals.map((deal, index) => (
            <Deal
              key={deal._id}
              index={index}
              dealId={deal._id}
              saveDeal={saveDeal}
              removeDeal={removeDeal}
              draggable
            />
          ))}
        </div>
        {provided.placeholder}
        {this.showDealForm()}
      </DropZone>
    );
  }

  render() {
    const { stage, deals, index, stageId } = this.props;

    console.log('stage: ', stage.name);

    return (
      <Draggable draggableId={stageId} index={index}>
        {(provided, snapshot) => (
          <Wrapper>
            <Container
              innerRef={provided.innerRef}
              {...provided.draggableProps}
              isDragging={snapshot.isDragging}
            >
              <Header {...provided.dragHandleProps}>
                <h3>
                  {stage.name}
                  <span>({deals.length})</span>
                </h3>
                <Amount>{this.renderAmount(stage.amount || {})}</Amount>
                <Indicator>{this.renderIndicator()}</Indicator>
              </Header>

              <Body>
                <Droppable droppableId={stageId} type="stage">
                  {dropProvided => this.renderDeal(dropProvided)}
                </Droppable>
              </Body>
            </Container>
          </Wrapper>
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
Stage.defaultProps = defaultProps;
