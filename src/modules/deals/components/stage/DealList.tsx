import { colors, grid } from 'modules/deals/constants';
import { DealItem } from 'modules/deals/containers/stage';
import { IDeal } from 'modules/deals/types';
import * as React from 'react';
import { Draggable, Droppable } from 'react-beautiful-dnd';
import styled from 'styled-components';
import styledTS from 'styled-components-ts';

const Wrapper = styledTS<{ isDraggingOver: boolean; isDropDisabled: boolean }>(
  styled.div
)`
  background-color: ${({ isDraggingOver }) =>
    isDraggingOver ? colors.blue.lighter : colors.blue.light};
  display: flex;
  flex-direction: column;
  opacity: ${({ isDropDisabled }) => (isDropDisabled ? 0.5 : 'inherit')};
  padding: ${grid}px;
  border: ${grid}px;
  padding-bottom: 0;
  transition: background-color 0.1s ease, opacity 0.1s ease;
  user-select: none;
  width: 250px;
`;

const DropZone = styled.div`
  /* stop the list collapsing when empty */
  min-height: 250px;

  /*
    not relying on the items for a margin-bottom
    as it will collapse when the list is empty
  */
  margin-bottom: ${grid}px;
`;

const ScrollContainer = styled.div`
  overflow-x: hidden;
  overflow-y: auto;
  max-height: 300px;
`;

type Props = {
  listId: string;
  listType?: string;
  stageId: string;
  deals: IDeal[];
  internalScroll?: boolean;
  isDropDisabled?: boolean;
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
      <div>
        <DropZone innerRef={dropProvided.innerRef}>
          <InnerDealList stageId={stageId} deals={deals} />
          {dropProvided.placeholder}
        </DropZone>
      </div>
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
      internalScroll,
      isDropDisabled,
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
        isDropDisabled={isDropDisabled}
      >
        {(dropProvided, dropSnapshot) => (
          <Wrapper
            style={style}
            isDraggingOver={dropSnapshot.isDraggingOver}
            isDropDisabled={isDropDisabled}
            {...dropProvided.droppableProps}
          >
            {internalScroll ? (
              <ScrollContainer>
                <InnerList
                  stageId={stageId}
                  deals={deals}
                  dropProvided={dropProvided}
                />
              </ScrollContainer>
            ) : (
              <InnerList
                stageId={stageId}
                deals={deals}
                dropProvided={dropProvided}
              />
            )}
          </Wrapper>
        )}
      </Droppable>
    );
  }
}
