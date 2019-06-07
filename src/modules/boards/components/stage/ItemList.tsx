import { EmptyState } from 'modules/common/components';
import * as React from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import { DropZone, EmptyContainer, Wrapper } from '../../styles/common';
import { IOptions, Item } from '../../types';
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
  options: IOptions;
};

class DraggableContainer extends React.Component<
  { stageId: string; item: Item; index: number; options: IOptions },
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
          <ItemSelector
            key={item._id}
            stageId={stageId}
            item={item}
            isDragging={dragSnapshot.isDragging}
            onTogglePopup={this.onTogglePopup}
            provided={dragProvided}
            options={options}
          />
        )}
      </Draggable>
    );
  }
}

class InnerItemList extends React.PureComponent<{
  stageId: string;
  items: Item[];
  options: IOptions;
}> {
  render() {
    const { stageId, items, options } = this.props;

    return items.map((item, index: number) => (
      <DraggableContainer
        key={item._id}
        stageId={stageId}
        item={item}
        index={index}
        options={options}
      />
    ));
  }
}

type InnerListProps = {
  dropProvided;
  stageId: string;
  items: Item[];
  options: IOptions;
};

class InnerList extends React.PureComponent<InnerListProps> {
  render() {
    const { stageId, items, dropProvided, options } = this.props;

    if (items.length === 0) {
      return (
        <EmptyContainer innerRef={dropProvided.innerRef}>
          <EmptyState
            icon="clipboard"
            text={`No ${options.type}`}
            size="small"
          />
        </EmptyContainer>
      );
    }

    return (
      <DropZone innerRef={dropProvided.innerRef}>
        <InnerItemList stageId={stageId} items={items} options={options} />
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
      options
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
              options={options}
            />
            {dropProvided.placeholder}
          </Wrapper>
        )}
      </Droppable>
    );
  }
}
