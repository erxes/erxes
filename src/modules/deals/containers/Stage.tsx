import * as React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { DealList } from '.';
import { Amount, Body, Container, Header } from '../styles/stage';
import { IDeal, IStage } from '../types';

type Props = {
  deals: IDeal[];
  stage: IStage;
};

export default class Stage extends React.Component<Props> {
  renderAmount(amount: number) {
    if (Object.keys(amount).length === 0) return <li>0</li>;

    return Object.keys(amount).map(key => (
      <li key={key}>
        {amount[key].toLocaleString()} <span>{key}</span>
      </li>
    ));
  }

  render() {
    const { deals, stage } = this.props;

    return (
      <Draggable draggableId={stage._id} index={stage._id}>
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
            </Header>
            <Body innerRef={provided.innerRef} {...provided.droppableProps}>
              <DealList listId={stage._id} listType="DEAL" deals={deals} />
            </Body>
          </Container>
        )}
      </Draggable>
    );
  }
}
