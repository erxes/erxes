import EmptyState from 'modules/common/components/EmptyState';
import routerUtils from 'modules/common/utils/router';
import queryString from 'query-string';
import React from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import history from '../../../../browserHistory';
import { DropZone, EmptyContainer, Wrapper } from '../../styles/common';
import { IItem, IOptions } from '../../types';

type Props = {
  listId: string;
  stageId: string;
  items: IItem[];
  internalScroll?: boolean;
  style?: any;
  // may not be provided - and might be null
  ignoreContainerClipping?: boolean;
  options: IOptions;
};

type DraggableContainerProps = {
  stageId: string;
  item: IItem;
  index: number;
  options: IOptions;
};

class DraggableContainer extends React.Component<
  DraggableContainerProps,
  { isDragDisabled: boolean; isFormVisible: boolean }
> {
  unlisten?: () => void;

  constructor(props: DraggableContainerProps) {
    super(props);

    const { item } = props;
    const itemIdQueryParam = routerUtils.getParam(history, 'itemId');

    let isFormVisible = false;

    if (itemIdQueryParam === item._id) {
      isFormVisible = true;
    }

    this.state = { isDragDisabled: false, isFormVisible };
  }

  componentDidMount() {
    this.unlisten = history.listen(location => {
      const queryParams = queryString.parse(location.search);

      if (queryParams.itemId === this.props.item._id) {
        return this.setState({ isFormVisible: true });
      }
    });
  }

  componentWillUnmount() {
    if (this.unlisten) {
      this.unlisten();
    }
  }

  onTogglePopup = () => {
    const { item } = this.props;
    const { isFormVisible, isDragDisabled } = this.state;
    const itemIdQueryParam = routerUtils.getParam(history, 'itemId');

    this.setState(
      { isDragDisabled: !isDragDisabled, isFormVisible: !isFormVisible },
      () => {
        if (itemIdQueryParam) {
          return routerUtils.removeParams(history, 'itemId');
        }

        return routerUtils.setParams(history, { itemId: item._id });
      }
    );
  };

  render() {
    const { stageId, item, index, options } = this.props;
    const { isDragDisabled, isFormVisible } = this.state;
    const ItemComponent = options.Item;

    return (
      <Draggable
        key={item._id}
        draggableId={item._id}
        index={index}
        isDragDisabled={isDragDisabled}
      >
        {(dragProvided, dragSnapshot) => (
          <ItemComponent
            key={item._id}
            stageId={stageId}
            item={item}
            isFormVisible={isFormVisible}
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
  items: IItem[];
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
  items: IItem[];
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
      style,
      stageId,
      items,
      options
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
