import { PIPELINE_UPDATE_STATUSES } from 'modules/boards/constants';
import {
  ActionButton,
  ActionList,
  AddNew,
  Body,
  Container,
  Header,
  HeaderAmount,
  Indicator,
  IndicatorItem,
  LoadingContent,
  StageFooter,
  StageRoot,
  StageTitle
} from 'modules/boards/styles/stage';
import EmptyState from 'modules/common/components/EmptyState';
import Icon from 'modules/common/components/Icon';
import ModalTrigger from 'modules/common/components/ModalTrigger';
import { __ } from 'modules/common/utils';
import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { OverlayTrigger, Popover } from 'react-bootstrap';
import { AddForm } from '../../containers/portable';
import { IItem, IOptions, IStage } from '../../types';
import { renderAmount } from '../../utils';
import ItemList from '../stage/ItemList';

type Props = {
  loadingItems: () => boolean;
  index: number;
  stage: IStage;
  length: number;
  items: IItem[];
  onAddItem: (stageId: string, item: IItem) => void;
  onRemoveItem: (itemId: string, stageId: string) => void;
  loadMore: () => void;
  options: IOptions;
  archiveItems: () => void;
  archiveList: () => void;
  onChangeRealTimeStageIds: (stageId: string) => void;
};
export default class Stage extends React.Component<Props, {}> {
  private bodyRef;
  private overlayTrigger;

  constructor(props: Props) {
    super(props);

    this.bodyRef = React.createRef();
  }

  componentDidMount() {
    // Load items until scroll created
    const handle = setInterval(() => {
      if (this.props.loadingItems()) {
        return;
      }

      const { current } = this.bodyRef;

      if (!current) {
        return;
      }

      const isScrolled = current.scrollHeight > current.clientHeight;

      if (isScrolled) {
        return clearInterval(handle);
      }

      const { items, stage } = this.props;

      if (items.length < stage.itemsTotalCount) {
        return this.props.loadMore();
      } else {
        return clearInterval(handle);
      }
    }, 1000);
  }

  componentDidUpdate(prevProps) {
    const { current } = this.bodyRef;

    if (!current) {
      return;
    }

    const { stage, onChangeRealTimeStageIds } = this.props;
    const pipelineUpdate = sessionStorage.getItem('pipelineUpdate');

    if (
      (pipelineUpdate === PIPELINE_UPDATE_STATUSES.START ||
        pipelineUpdate === PIPELINE_UPDATE_STATUSES.NEW_REQUEST) &&
      stage.itemsTotalCount !== prevProps.stage.itemsTotalCount
    ) {
      onChangeRealTimeStageIds(stage._id);
    }
  }

  shouldComponentUpdate(nextProps: Props) {
    const { stage, index, length, items, loadingItems } = this.props;

    if (
      index !== nextProps.index ||
      loadingItems() !== nextProps.loadingItems() ||
      length !== nextProps.length ||
      JSON.stringify(stage) !== JSON.stringify(nextProps.stage) ||
      items.length !== nextProps.items.length
    ) {
      return true;
    }

    return false;
  }

  onScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const bottom =
      target.scrollHeight - target.scrollTop === target.clientHeight;

    if (bottom) {
      this.props.loadMore();
    }
  };

  renderAddItemTrigger() {
    const { options, stage, onAddItem } = this.props;
    const addText = options.texts.addText;

    const trigger = (
      <StageFooter>
        <AddNew>
          <Icon icon="plus-1" />
          {__(addText)}
        </AddNew>
      </StageFooter>
    );

    const formProps = {
      options,
      showSelect: false,
      callback: (item: IItem) => onAddItem(stage._id, item),
      stageId: stage._id
    };

    const content = props => <AddForm {...props} {...formProps} />;

    return <ModalTrigger title={addText} trigger={trigger} content={content} />;
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

  onClosePopover = () => {
    this.overlayTrigger.hide();
  };

  renderItemList() {
    const { stage, items, loadingItems, options, onRemoveItem } = this.props;

    if (loadingItems()) {
      return (
        <LoadingContent>
          <img alt="Loading" src="/images/loading-content.gif" />
        </LoadingContent>
      );
    }

    return (
      <ItemList
        listId={stage._id}
        stageId={stage._id}
        items={items}
        options={options}
        onRemoveItem={onRemoveItem}
      />
    );
  }

  renderPopover() {
    const archiveList = () => {
      this.props.archiveList();
      this.onClosePopover();
    };

    const archiveItems = () => {
      this.props.archiveItems();
      this.onClosePopover();
    };

    return (
      <Popover id="stage-popover">
        <ActionList>
          <li onClick={archiveItems} key="archive-items">
            Archive All Cards in This List
          </li>
          <li onClick={archiveList} key="archive-list">
            Archive This List
          </li>
        </ActionList>
      </Popover>
    );
  }

  renderCtrl() {
    return (
      <OverlayTrigger
        ref={overlayTrigger => {
          this.overlayTrigger = overlayTrigger;
        }}
        trigger="click"
        placement="bottom-start"
        rootClose={true}
        container={this}
        overlay={this.renderPopover()}
      >
        <ActionButton>
          <Icon icon="ellipsis-h" />
        </ActionButton>
      </OverlayTrigger>
    );
  }

  render() {
    const { index, stage } = this.props;

    if (!stage) {
      return <EmptyState icon="columns-1" text="No stage" size="small" />;
    }

    return (
      <Draggable draggableId={stage._id} index={index}>
        {(provided, snapshot) => (
          <Container innerRef={provided.innerRef} {...provided.draggableProps}>
            <StageRoot isDragging={snapshot.isDragging}>
              <Header {...provided.dragHandleProps}>
                <StageTitle>
                  <div>
                    {stage.name}
                    <span>{stage.itemsTotalCount}</span>
                  </div>
                  {this.renderCtrl()}
                </StageTitle>
                <HeaderAmount>{renderAmount(stage.amount)}</HeaderAmount>
                <Indicator>{this.renderIndicator()}</Indicator>
              </Header>
              <Body innerRef={this.bodyRef} onScroll={this.onScroll}>
                {this.renderItemList()}
              </Body>
              {this.renderAddItemTrigger()}
            </StageRoot>
          </Container>
        )}
      </Draggable>
    );
  }
}
