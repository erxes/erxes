import client from 'apolloClient';
import gql from 'graphql-tag';
import EmptyState from 'modules/common/components/EmptyState';
import Icon from 'modules/common/components/Icon';
import { IRouterProps } from 'modules/common/types';
import routerUtils from 'modules/common/utils/router';
import { mutations as notificationMutations } from 'modules/notifications/graphql';
import React from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { withRouter } from 'react-router-dom';
import {
  DropZone,
  EmptyContainer,
  ItemContainer,
  NotifiedContainer,
  Wrapper
} from '../../styles/common';
import { IItem, IOptions } from '../../types';
import Item from './Item';

type Props = {
  listId: string;
  stageId: string;
  items: IItem[];
  internalScroll?: boolean;
  style?: any;
  // may not be provided - and might be null
  ignoreContainerClipping?: boolean;
  options: IOptions;
  onRemoveItem: (itemId: string, stageId: string) => void;
};

type DraggableContainerProps = {
  stageId: string;
  item: IItem;
  index: number;
  options: IOptions;
  onRemoveItem: (itemId: string, stageId: string) => void;
} & IRouterProps;

class DraggableContainer extends React.Component<
  DraggableContainerProps,
  { isDragDisabled: boolean; hasNotified: boolean }
> {
  constructor(props: DraggableContainerProps) {
    super(props);

    // if popup shows, draggable will disable
    const itemIdQueryParam = routerUtils.getParam(props.history, 'itemId');

    this.state = {
      isDragDisabled: Boolean(itemIdQueryParam),
      hasNotified: props.item.hasNotified === false ? false : true
    };
  }

  onClick = () => {
    const { item, history } = this.props;

    this.setState({ isDragDisabled: true }, () => {
      routerUtils.setParams(history, { itemId: item._id, key: '' });
    });

    if (!this.state.hasNotified) {
      client.mutate({
        mutation: gql(notificationMutations.markAsRead),
        variables: {
          contentTypeId: item._id
        }
      });
    }
  };

  beforePopupClose = () => {
    const { item, onRemoveItem } = this.props;

    if (item.status === 'archived') {
      onRemoveItem(item._id, item.stageId);
    }

    this.setState({ isDragDisabled: false, hasNotified: true });
  };

  renderHasNotified() {
    if (this.state.hasNotified) {
      return null;
    }

    return (
      <NotifiedContainer>
        <Icon icon="bell" size={14} />
      </NotifiedContainer>
    );
  }

  render() {
    const { stageId, item, index, options } = this.props;
    const { isDragDisabled } = this.state;

    return (
      <Draggable
        key={item._id}
        draggableId={item._id}
        index={index}
        isDragDisabled={isDragDisabled}
      >
        {(dragProvided, dragSnapshot) => (
          <ItemContainer
            isDragging={dragSnapshot.isDragging}
            innerRef={dragProvided.innerRef}
            {...dragProvided.draggableProps}
            {...dragProvided.dragHandleProps}
          >
            {this.renderHasNotified()}
            <Item
              key={item._id}
              stageId={stageId}
              item={item}
              onClick={this.onClick}
              beforePopupClose={this.beforePopupClose}
              options={options}
            />
          </ItemContainer>
        )}
      </Draggable>
    );
  }
}

const DraggableContainerWithRouter = withRouter<DraggableContainerProps>(
  DraggableContainer
);

class InnerItemList extends React.PureComponent<{
  stageId: string;
  items: IItem[];
  options: IOptions;
  onRemoveItem: (itemId: string, stageId: string) => void;
}> {
  render() {
    const { stageId, items, options, onRemoveItem } = this.props;

    return items.map((item, index: number) => (
      <DraggableContainerWithRouter
        key={item._id}
        stageId={stageId}
        item={item}
        index={index}
        options={options}
        onRemoveItem={onRemoveItem}
      />
    ));
  }
}

type InnerListProps = {
  dropProvided;
  stageId: string;
  items: IItem[];
  options: IOptions;
  onRemoveItem: (itemId: string, stageId: string) => void;
};

class InnerList extends React.PureComponent<InnerListProps> {
  render() {
    const { stageId, items, dropProvided, options, onRemoveItem } = this.props;

    if (items.length === 0) {
      return (
        <EmptyContainer innerRef={dropProvided.innerRef}>
          <EmptyState icon="postcard" text="No item" size="small" />
        </EmptyContainer>
      );
    }

    return (
      <DropZone innerRef={dropProvided.innerRef}>
        <InnerItemList
          onRemoveItem={onRemoveItem}
          stageId={stageId}
          items={items}
          options={options}
        />
        {dropProvided.placeholder}
      </DropZone>
    );
  }
}

export default class ItemList extends React.Component<Props> {
  static defaultProps = {
    listId: 'LIST'
  };

  render() {
    const {
      ignoreContainerClipping,
      listId,
      style,
      stageId,
      items,
      options,
      onRemoveItem
    } = this.props;

    return (
      <Droppable
        droppableId={listId}
        ignoreContainerClipping={ignoreContainerClipping}
      >
        {(dropProvided, dropSnapshot) => (
          <Wrapper
            style={style}
            isDraggingOver={dropSnapshot.isDraggingOver}
            {...dropProvided.droppableProps}
          >
            <InnerList
              onRemoveItem={onRemoveItem}
              stageId={stageId}
              items={items}
              dropProvided={dropProvided}
              options={options}
            />
            {dropProvided.placeholder}
          </Wrapper>
        )}
      </Droppable>
    );
  }
}
