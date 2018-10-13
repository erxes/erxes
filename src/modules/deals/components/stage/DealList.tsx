import { DealItem } from 'modules/deals/containers/stage';
import { DropZone, Wrapper } from 'modules/deals/styles/stage';
import { IDeal } from 'modules/deals/types';
import * as React from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';

type Props = {
  listId: string;
  listType?: string;
  stageId: string;
  deals: IDeal[];
  internalScroll?: boolean;
  style?: any;
  // may not be provided - and might be null
  ignoreContainerClipping?: boolean;
};

class InnerDealList extends React.Component<{
  stageId: string;
  deals: IDeal[];
}> {
  shouldComponentUpdate(nextProps) {
    return nextProps.deals !== this.props.deals;
  }

  render() {
    const { stageId, deals } = this.props;

    return deals.map((deal, index: number) => (
      <Draggable key={deal._id} draggableId={deal._id} index={index}>
        {(dragProvided, dragSnapshot) => (
          <DealItem
            key={deal._id}
            index={index}
            stageId={stageId}
            deal={deal}
            isDragging={dragSnapshot.isDragging}
            provided={dragProvided}
          />
        )}
      </Draggable>
    ));
  }
}

type InnerListProps = {
  dropProvided;
  stageId: string;
  deals: IDeal[];
};

class InnerList extends React.Component<InnerListProps> {
  render() {
    const { stageId, deals, dropProvided } = this.props;

    return (
      <DropZone innerRef={dropProvided.innerRef}>
        <InnerDealList stageId={stageId} deals={deals} />
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
      deals
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
              deals={deals}
              dropProvided={dropProvided}
            />
          </Wrapper>
        )}
      </Droppable>
    );
  }
}
