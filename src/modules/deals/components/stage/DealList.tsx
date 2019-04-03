import { EmptyState } from 'modules/common/components';
import { DealItem } from 'modules/deals/containers/stage';
import { DropZone, EmptyContainer, Wrapper } from 'modules/deals/styles/stage';
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
class DraggableContainer extends React.Component<
  { stageId: string; deal: IDeal; index: number },
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
    const { stageId, deal, index } = this.props;
    const { isDragDisabled } = this.state;

    return (
      <Draggable
        key={deal._id}
        draggableId={deal._id}
        index={index}
        isDragDisabled={isDragDisabled}
      >
        {(dragProvided, dragSnapshot) => (
          <DealItem
            key={deal._id}
            stageId={stageId}
            deal={deal}
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
  deals: IDeal[];
}> {
  render() {
    const { stageId, deals } = this.props;

    return deals.map((deal, index: number) => (
      <DraggableContainer
        key={deal._id}
        stageId={stageId}
        deal={deal}
        index={index}
      />
    ));
  }
}

type InnerListProps = {
  dropProvided;
  stageId: string;
  deals: IDeal[];
};

class InnerList extends React.PureComponent<InnerListProps> {
  render() {
    const { stageId, deals, dropProvided } = this.props;
    if (deals.length === 0) {
      return (
        <EmptyContainer innerRef={dropProvided.innerRef}>
          <EmptyState icon="clipboard" text="No deal" size="small" />
        </EmptyContainer>
      );
    }

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
            {dropProvided.placeholder}
          </Wrapper>
        )}
      </Droppable>
    );
  }
}
