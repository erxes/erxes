import { Icon, ModalTrigger } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { DealAddForm } from '.';
import { Deal } from '../containers';
import { AddNew } from '../styles/deal';
import {
  Amount,
  Body,
  Container,
  DropZone,
  Header,
  Indicator,
  IndicatorItem
} from '../styles/stage';
import { ICommonParams, IDeal, IDealParams, IStage } from '../types';

type Props = {
  stage: IStage;
  deals: ICommonParams[];
  index?: number;
  length?: number;
  saveDeal: (doc: IDealParams, callback: () => void, deal?: IDeal) => void;
  removeDeal: (_id: string) => void;
  stageId: string;
};

class Stage extends React.Component<Props> {
  renderAmount(amount: number) {
    if (Object.keys(amount).length === 0) return <li>0</li>;

    return Object.keys(amount).map(key => (
      <li key={key}>
        {amount[key].toLocaleString()} <span>{key}</span>
      </li>
    ));
  }

  showDealForm() {
    const { stage, saveDeal } = this.props;

    const trigger = (
      <AddNew>
        <Icon icon="add" /> {__('Add a deal')}
      </AddNew>
    );

    return (
      <ModalTrigger 
        title="Add a deal" 
        trigger={trigger}
        content={(props) => <DealAddForm {...props} stageId={stage._id} saveDeal={saveDeal} />}
       />
    );
  }

  renderIndicator() {
    const index = this.props.index || 0;
    const length = this.props.length || 0;
    const data: any = [];
    
    for(let i = 0; i <= length; i++) {
      data.push(<IndicatorItem isPass={index >= i} key={i} />)
    }

    return data;
  }

  renderDeals(provided) {
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

    return (
      <Draggable draggableId={stageId} index={index}>
        {(provided, snapshot) => (
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
                {dropProvided => this.renderDeals(dropProvided)}
              </Droppable>
            </Body>
          </Container>
        )}
      </Draggable>
    );
  }
}

export default Stage;
