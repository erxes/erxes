import * as React from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import DealItem from '../components/DealItem';
import { DropZone } from '../styles/stage';
import { IDeal } from '../types';

const ScrollContainer = styled.div`
  overflow-x: hidden;
  overflow-y: auto;
  max-height: 300px;
`;

type Props = {
  listId: string;
  listType?: string;
  deals: IDeal[];
  title?: string;
  internalScroll?: boolean;
  isDropDisabled?: boolean;
  style?: any;
};

type DealListProps = {
  deals: IDeal[];
};

class InnerDealList extends React.Component<DealListProps> {
  shouldComponentUpdate(nextProps: DealListProps) {
    if (nextProps.deals !== this.props.deals) {
      return true;
    }

    return false;
  }

  render() {
    return this.props.deals.map((deal, index: number) => (
      <Draggable key={deal._id} draggableId={deal._id} index={index}>
        {(dragProvided, dragSnapshot) => (
          <DealItem
            key={deal._id}
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
  deals: any[];
  title?: string;
};

class InnerList extends React.Component<InnerListProps> {
  render() {
    const { deals, dropProvided } = this.props;

    return (
      <DropZone innerRef={dropProvided.innerRef}>
        <InnerDealList deals={deals} />
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
      internalScroll,
      isDropDisabled,
      listId,
      listType,
      style,
      deals,
      title
    } = this.props;

    return (
      <Droppable
        droppableId={listId}
        type={listType}
        ignoreContainerClipping={true}
        isDropDisabled={isDropDisabled}
      >
        {(dropProvided, dropSnapshot) => (
          <DropZone innerRef={dropProvided.innerRef}>
            <div className="deals">
              {internalScroll ? (
                <ScrollContainer>
                  <InnerList
                    deals={deals}
                    title={title}
                    dropProvided={dropProvided}
                  />
                </ScrollContainer>
              ) : (
                <InnerList
                  deals={deals}
                  title={title}
                  dropProvided={dropProvided}
                />
              )}
            </div>
          </DropZone>
        )}
      </Droppable>
    );
  }
}
