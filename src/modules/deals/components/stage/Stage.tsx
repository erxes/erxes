import { Icon, ModalTrigger } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import { borderRadius, colors, grid } from 'modules/deals/constants';
import { AddNew } from 'modules/deals/styles/deal';
import { IDeal, IStage } from 'modules/deals/types';
import * as React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';
import { DealAddForm } from '.';
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
  index: number;
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
    const { index, stage, deals } = this.props;

    return (
      <Draggable draggableId={stage.name} index={index}>
        {(provided, snapshot) => (
          <Container innerRef={provided.innerRef} {...provided.draggableProps}>
            <Header isDragging={snapshot.isDragging}>
              <Title
                isDragging={snapshot.isDragging}
                {...provided.dragHandleProps}
              >
                {stage.name}
                <span>({deals.length})</span>
                {this.renderAmount(stage.amount)}
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
