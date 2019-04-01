import { EmptyState, Icon, ModalTrigger } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import {
  AddNew,
  Body,
  Container,
  Header,
  Indicator,
  IndicatorItem,
  LoadingContent,
  ScrollContent,
  StageFooter,
  StageRoot
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
export default class Stage extends React.Component<Props, {}> {
  private bodyRef;

  constructor(props: Props) {
    super(props);

    this.bodyRef = React.createRef();
  }

  componentDidMount() {
    // Load deals until scroll created
    const handle = setInterval(() => {
      const { current } = this.bodyRef;

      if (!current) {
        return;
      }

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
          <Icon icon="add" />
          {__('Add a deal')}
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
    const { stage, index, length, deals, loadingDeals } = this.props;

    if (
      index !== nextProps.index ||
      loadingDeals !== nextProps.loadingDeals ||
      length !== nextProps.length ||
      JSON.stringify(stage) !== JSON.stringify(nextProps.stage) ||
      JSON.stringify(deals) !== JSON.stringify(nextProps.deals)
    ) {
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
        {(provided, snapshot) => (
          <Container innerRef={provided.innerRef} {...provided.draggableProps}>
            <StageRoot isDragging={snapshot.isDragging}>
              <Header {...provided.dragHandleProps}>
                <h4>
                  {stage.name}
                  <span>{stage.dealsTotalCount}</span>
                </h4>
                <span>{renderDealAmount(stage.amount)}</span>
                <Indicator>{this.renderIndicator()}</Indicator>
              </Header>
              <Body innerRef={this.bodyRef}>
                <ScrollContent onScroll={this.onScroll}>
                  {loadingDeals ? (
                    <LoadingContent>
                      <img src="/images/loading-content.gif" />
                    </LoadingContent>
                  ) : null}
                  <DealList
                    listId={stage._id}
                    listType="DEAL"
                    stageId={stage._id}
                    deals={deals}
                  />
                </ScrollContent>
              </Body>
              {this.renderAddDealTrigger()}
            </StageRoot>
          </Container>
        )}
      </Draggable>
    );
  }
}
