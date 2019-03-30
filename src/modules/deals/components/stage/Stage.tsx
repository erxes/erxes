import { EmptyState, Icon, ModalTrigger } from 'modules/common/components';
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
  loadingDeals: boolean;
  index: number;
  stage: IStage;
  length: number;
  deals: IDeal[];
  addDeal: (name: string, callback: () => void) => void;
  loadMore: () => void;
};
export default class Stage extends React.Component<
  Props,
  { bodyRect: { left: number; width: number } }
> {
  private bodyRef;

  constructor(props: Props) {
    super(props);

    this.bodyRef = React.createRef();
  }

  componentDidMount() {
    // Load deals until scroll created
    const handle = setInterval(() => {
      const { current } = this.bodyRef;
      const isScrolled = current.scrollHeight > current.clientHeight;

      if (isScrolled) {
        clearInterval(handle);
      }

      const { deals, stage, loadMore } = this.props;

      if (deals.length < stage.dealsTotalCount) {
        loadMore();
      } else {
        clearInterval(handle);
      }
    }, 1000);
  }

  onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const bottom =
      target.scrollHeight - target.scrollTop === target.clientHeight;

    if (bottom) {
      this.props.loadMore();
    }
  };

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

  shouldComponentUpdate(nextProps: Props) {
    const { stage, deals, loadingDeals } = this.props;

    if (JSON.stringify(stage) !== JSON.stringify(nextProps.stage)) {
      return true;
    }

    if (deals.length !== nextProps.deals.length) {
      return true;
    }

    if (loadingDeals !== nextProps.loadingDeals) {
      return true;
    }

    return false;
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
                <span>{stage.dealsTotalCount}</span>
              </h4>
              <span>{renderDealAmount(stage.amount)}</span>
              <Indicator>{this.renderIndicator()}</Indicator>
            </Header>
            <Body innerRef={this.bodyRef} onScroll={this.onScroll}>
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
