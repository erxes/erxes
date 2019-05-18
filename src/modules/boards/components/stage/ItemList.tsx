import { EmptyState } from 'modules/common/components';
import * as React from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { DropZone, EmptyContainer, Wrapper } from '../../styles';
import { Item } from '../../types';
import { ItemSelector } from './';

type Props = {
  listId: string;
  listType?: string;
  stageId: string;
  items: Item[];
  internalScroll?: boolean;
  style?: any;
  // may not be provided - and might be null
  ignoreContainerClipping?: boolean;
  type: string;
};

class DraggableContainer extends React.Component<
  { stageId: string; item: Item; index: number; type: string },
  { isDragDisabled: boolean }
> {
  constructor(props) {
    super(props);

    this.state = { isDragDisabled: false };
  }

  onTogglePopup = () => {
    const { isDragDisabled } = this.state;

    this.setState({ isDragDisabled: !isDragDisabled });
  };

  render() {
    const { stageId, item, index, type } = this.props;
    const { isDragDisabled } = this.state;

    return (
      <Draggable
        key={item._id}
        draggableId={item._id}
        index={index}
        isDragDisabled={isDragDisabled}
      >
        {(dragProvided, dragSnapshot) => (
          <ItemSelector
            key={item._id}
            stageId={stageId}
            item={item}
            isDragging={dragSnapshot.isDragging}
            onTogglePopup={this.onTogglePopup}
            provided={dragProvided}
            type={type}
          />
        )}
      </Draggable>
    );
  }
}

class InnerItemList extends React.PureComponent<{
  stageId: string;
  items: Item[];
  type: string;
}> {
  render() {
    const { stageId, items, type } = this.props;

    return items.map((item, index: number) => (
      <DraggableContainer
        key={item._id}
        stageId={stageId}
        item={item}
        index={index}
        type={type}
      />
    ));
  }
}

type InnerListProps = {
  dropProvided;
  stageId: string;
  items: Item[];
  type: string;
};

class InnerList extends React.PureComponent<InnerListProps> {
  render() {
    const { stageId, items, dropProvided, type } = this.props;

    if (items.length === 0) {
      return (
        <EmptyContainer innerRef={dropProvided.innerRef}>
          <EmptyState icon="clipboard" text={`No ${type}`} size="small" />
        </EmptyContainer>
      );
    }

    return (
      <DropZone innerRef={dropProvided.innerRef}>
        <InnerItemList stageId={stageId} items={items} type={type} />
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
      listType,
      style,
      stageId,
      items,
      type
    } = this.props;

    return (
      <Droppable
        droppableId={listId}
        type={listType}
        ignoreContainerClipping={ignoreContainerClipping}
      >
        {(dropProvided, dropSnapshot) => (
          <Wrapper
            style={style}
            isDraggingOver={dropSnapshot.isDraggingOver}
            {...dropProvided.droppableProps}
          >
            <InnerList
              stageId={stageId}
              items={items}
              dropProvided={dropProvided}
              type={type}
            />
            {dropProvided.placeholder}
          </Wrapper>
        )}
      </Droppable>
    );
  }
}
