import { Icon, ModalTrigger } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import * as React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { DealAddForm } from '.';
import { borderRadius, colors, grid } from '../constants';
import { AddNew } from '../styles/deal';
import { IDeal, IStage } from '../types';
import DealList from './DealList';
import Title from './Title';

const Container = styled.div`
  margin: ${grid}px;
  display: flex;
  flex-direction: column;
`;

const Header = styledTS<{ isDragging: boolean }>(styled.div)`
  display: flex;
  align-items: center;
  justify-content: center;
  border-top-left-radius: ${borderRadius}px;
  border-top-right-radius: ${borderRadius}px;
  background-color: ${({ isDragging }) =>
    isDragging ? colors.blue.lighter : colors.blue.light};
  transition: background-color 0.1s ease;

  &:hover {
    background-color: ${colors.blue.lighter};
  }
`;

type Props = {
  stage: IStage;
  deals: IDeal[];
  addDeal: (name: string, callback: () => void) => void;
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

  renderAddDealTrigger() {
    const { addDeal } = this.props;

    const trigger = (
      <AddNew>
        <Icon icon="add" /> {__('Add a deal')}
      </AddNew>
    );

    return (
      <ModalTrigger
        title="Add a deal"
        trigger={trigger}
        content={props => <DealAddForm {...props} add={addDeal} />}
      />
    );
  }

  render() {
    const { stage, deals } = this.props;

    return (
      <Draggable draggableId={stage.name} index={stage._id}>
        {(provided, snapshot) => (
          <Container innerRef={provided.innerRef} {...provided.draggableProps}>
            <Header isDragging={snapshot.isDragging}>
              <Title
                isDragging={snapshot.isDragging}
                {...provided.dragHandleProps}
              >
                {stage.name}
                <span>({deals.length})</span>
              </Title>
            </Header>

            <DealList
              listId={stage._id}
              listType="DEAL"
              stageId={stage._id}
              deals={deals}
            />

            {this.renderAddDealTrigger()}
          </Container>
        )}
      </Draggable>
    );
  }
}
