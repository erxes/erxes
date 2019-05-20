import ItemList from 'modules/boards/components/stage/ItemList';
import { IStage, Item } from 'modules/boards/types';
import { EmptyState } from 'modules/common/components';
import { __ } from 'modules/common/utils';
import {
  Body,
  Container,
  Header,
  Indicator,
  IndicatorItem,
  LoadingContent,
  StageRoot
} from 'modules/deals/styles/stage';
import * as React from 'react';
import { Draggable } from 'react-beautiful-dnd';

type Props = {
  loadingItems: boolean;
  index: number;
  stage: IStage;
  length: number;
  items: Item[];
  loadMore: () => void;
};

export default class Stage extends React.Component<Props, {}> {
  private bodyRef;

  constructor(props: Props) {
    super(props);

    this.bodyRef = React.createRef();
  }

  componentDidMount() {
    // Load items until scroll created
    const handle = setInterval(() => {
      const { current } = this.bodyRef;

      if (!current) {
        return;
      }

      const isScrolled = current.scrollHeight > current.clientHeight;

      if (isScrolled) {
        clearInterval(handle);
      }

      const { items, stage, loadMore } = this.props;

      if (items.length < stage.itemsTotalCount) {
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
    const { stage, index, length, items, loadingItems } = this.props;

    if (
      index !== nextProps.index ||
      loadingItems !== nextProps.loadingItems ||
      length !== nextProps.length ||
      JSON.stringify(stage) !== JSON.stringify(nextProps.stage) ||
      JSON.stringify(items) !== JSON.stringify(nextProps.items)
    ) {
      return true;
    }

    return false;
  }

  renderItemList() {
    const { stage, items, loadingItems } = this.props;

    if (loadingItems) {
      return (
        <LoadingContent>
          <img src="/images/loading-content.gif" />
        </LoadingContent>
      );
    }

    return (
      <ItemList
        listId={stage._id}
        listType="DEAL"
        stageId={stage._id}
        items={items}
        type="ticket"
      />
    );
  }

  render() {
    const { index, stage } = this.props;

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
                  <span>{stage.itemsTotalCount}</span>
                </h4>
                <Indicator>{this.renderIndicator()}</Indicator>
              </Header>
              <Body innerRef={this.bodyRef} onScroll={this.onScroll}>
                {this.renderItemList()}
              </Body>
            </StageRoot>
          </Container>
        )}
      </Draggable>
    );
  }
}
