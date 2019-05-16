import { EmptyState } from 'modules/common/components';
import { DealItem } from 'modules/deals/containers/stage';
import * as React from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { DropZone, EmptyContainer, Wrapper } from '../../styles/stage';
import { Item } from '../../types';

type Props = {
  listId: string;
  listType?: string;
  stageId: string;
  items: Item[];
  internalScroll?: boolean;
  style?: any;
  // may not be provided - and might be null
  ignoreContainerClipping?: boolean;
};
class DraggableContainer extends React.Component<
  { stageId: string; item: Item; index: number },
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
    const { stageId, item, index } = this.props;
    const { isDragDisabled } = this.state;

    return (
      <Draggable
        key={item._id}
        draggableId={item._id}
        index={index}
        isDragDisabled={isDragDisabled}
      >
        {(dragProvided, dragSnapshot) => (
          <DealItem
            key={item._id}
            stageId={stageId}
            deal={item}
            isDragging={dragSnapshot.isDragging}
            onTogglePopup={this.onTogglePopup}
            provided={dragProvided}
          />
        )}
      </Draggable>
    );
  }
}

class InnerDealList extends React.PureComponent<{
  stageId: string;
  items: Item[];
}> {
  render() {
    const { stageId, items } = this.props;

    return items.map((item, index: number) => (
      <DraggableContainer
        key={item._id}
        stageId={stageId}
        item={item}
        index={index}
      />
    ));
  }
}

type InnerListProps = {
  dropProvided;
  stageId: string;
  items: Item[];
};

class InnerList extends React.PureComponent<InnerListProps> {
  render() {
    const { stageId, items, dropProvided } = this.props;
    if (items.length === 0) {
      return (
        <EmptyContainer innerRef={dropProvided.innerRef}>
          <EmptyState icon="clipboard" text="No deal" size="small" />
        </EmptyContainer>
      );
    }

    return (
      <DropZone innerRef={dropProvided.innerRef}>
        <InnerDealList stageId={stageId} items={items} />
        {dropProvided.placeholder}
      </DropZone>
    );
  }
}

export default class DealList extends React.Component<Props> {
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
      items
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
            />
            {dropProvided.placeholder}
          </Wrapper>
        )}
      </Droppable>
    );
  }
}
