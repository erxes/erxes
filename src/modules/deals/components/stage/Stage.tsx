import {
  EmptyState,
  Icon,
  ModalTrigger,
  Spinner
} from 'modules/common/components';
import { __ } from 'modules/common/utils';
import {
  AddNew,
  Body,
  Container,
  Header,
  Indicator,
  IndicatorItem,
  StageFooter
} from 'modules/deals/styles/stage';
import { IDeal, IStage } from 'modules/deals/types';
import { renderDealAmount } from 'modules/deals/utils';
import * as React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { DealAddForm } from '.';
import DealList from './DealList';

type Props = {
  loadingDeals;
  index: number;
  stage?: IStage;
  length: number;
  deals: IDeal[];
  addDeal: (name: string, callback: () => void) => void;
};

export default class Stage extends React.Component<Props> {
  renderAddDealTrigger() {
    const { addDeal } = this.props;

    const trigger = (
      <StageFooter>
        <AddNew>
          <Icon icon="add" /> {__('Add a deal')}
        </AddNew>
      </StageFooter>
    );

    const content = props => <DealAddForm {...props} add={addDeal} />;

    return (
      <ModalTrigger title="Add a deal" trigger={trigger} content={content} />
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
    const { index, stage, deals, loadingDeals } = this.props;

    if (!stage) {
      return <EmptyState icon="clipboard" text="No stage" size="small" />;
    }

    return (
      <Draggable draggableId={stage.name} index={index}>
        {provided => (
          <Container innerRef={provided.innerRef} {...provided.draggableProps}>
            <Header {...provided.dragHandleProps}>
              <h4>
                {stage.name}
                <span>({deals.length})</span>
              </h4>
              {renderDealAmount(stage.amount)}
              <Indicator>{this.renderIndicator()}</Indicator>
            </Header>
            <Body>
              {loadingDeals ? <span>Loading ...</span> : null}
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
