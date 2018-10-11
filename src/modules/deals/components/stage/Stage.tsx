import { Icon, ModalTrigger } from 'modules/common/components';
import colors from 'modules/common/styles/colors';
import { __ } from 'modules/common/utils';
import { AddNew } from 'modules/deals/styles/deal';
import {
  Body,
  Container,
  Header,
  Indicator,
  IndicatorItem
} from 'modules/deals/styles/stage';
import { IDeal, IStage } from 'modules/deals/types';
import { renderDealAmount } from 'modules/deals/utils';
import * as React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import { DealAddForm } from '.';
import DealList from './DealList';

const Title = styled('h4')`
  margin: 0;
  font-size: 11px;
  line-height: inherit;
  text-transform: uppercase;
  font-weight: bold;

  span {
    color: ${colors.bgMain};
    margin-left: 5px;
  }
`;

type Props = {
  index: number;
  stage: IStage;
  length: number;
  deals: IDeal[];
  addDeal: (name: string, callback: () => void) => void;
};

export default class Stage extends React.Component<Props> {
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

  renderIndicator() {
    const index = this.props.index || 0;
    const length = this.props.length || 0;

    const data: any = [];

    for (let i = 0; i < length; i++) {
      data.push(<IndicatorItem isPass={index >= i} key={i} />);
    }

    return data;
  }

  render() {
    const { index, stage, deals } = this.props;

    return (
      <Draggable draggableId={stage.name} index={index}>
        {(provided, snapshot) => (
          <Container innerRef={provided.innerRef} {...provided.draggableProps}>
            <Header>
              <Title
                isDragging={snapshot.isDragging}
                {...provided.dragHandleProps}
              >
                {stage.name}
                <span>({deals.length})</span>
              </Title>
              {renderDealAmount(stage.amount)}
              <Indicator>{this.renderIndicator()}</Indicator>
            </Header>
            <Body>
              <DealList
                listId={stage._id}
                listType="DEAL"
                stageId={stage._id}
                deals={deals}
              />
            </Body>
            {this.renderAddDealTrigger()}
          </Container>
        )}
      </Draggable>
    );
  }
}
