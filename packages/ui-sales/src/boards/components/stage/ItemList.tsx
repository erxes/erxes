import * as routerUtils from "@erxes/ui/src/utils/router";

import { Draggable, Droppable } from "react-beautiful-dnd";
import { DropZone, EmptyContainer, Wrapper } from "../../styles/common";
import { IItem, IOptions } from "../../types";
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import EmptyState from "@erxes/ui/src/components/EmptyState";
import Item from "./Item";
import client from "@erxes/ui/src/apolloClient";
import dayjs from "dayjs";
import { gql } from "@apollo/client";
import { mutations } from "@erxes/ui-notifications/src/graphql";

type Props = {
  listId: string;
  stageId: string;
  stageAge?: number;
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
  stageAge?: number;
  item: IItem;
  index: number;
  options: IOptions;
  onRemoveItem: (itemId: string, stageId: string) => void;
};

function DraggableContainer(props: DraggableContainerProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const itemIdQueryParam = routerUtils.getParam(location, "itemId");
  const { stageId, item, index, options, stageAge } = props;

  const [isDragDisabled, setIsDragDisabled] = useState<boolean>(
    Boolean(itemIdQueryParam)
  );
  const [hasNotified, setHasNotified] = useState(
    item.hasNotified === false ? false : true
  );

  const onClick = () => {
    setIsDragDisabled(true);

    routerUtils.setParams(navigate, location, { itemId: item._id, key: "" });

    if (!hasNotified) {
      client.mutate({
        mutation: gql(mutations.markAsRead),
        variables: {
          contentTypeId: item._id,
        },
      });
    }
  };

  const beforePopupClose = () => {
    const { onRemoveItem } = props;

    if (item.status === "archived") {
      onRemoveItem(item._id, item.stageId);
    }

    setIsDragDisabled(false);
    setHasNotified(true);
  };

  const now = dayjs(new Date());
  const createdAt = dayjs(item.createdAt);
  const isOld =
    !stageAge || stageAge <= 0 ? false : now.diff(createdAt, "day") > stageAge;

  return (
    <Draggable
      key={item._id}
      draggableId={item._id}
      index={index}
      isDragDisabled={isDragDisabled}
    >
      {(dragProvided, dragSnapshot) => (
        <Item
          dragProvided={dragProvided}
          dragSnapshot={dragSnapshot}
          isOld={isOld}
          key={item._id}
          stageId={stageId}
          item={item}
          onClick={onClick}
          hasNotified={hasNotified}
          beforePopupClose={beforePopupClose}
          options={options}
        />
      )}
    </Draggable>
  );
}

const DraggableContainerWithRouter = DraggableContainer;

class InnerItemList extends React.PureComponent<{
  stageId: string;
  stageAge?: number;
  items: IItem[];
  options: IOptions;
  onRemoveItem: (itemId: string, stageId: string) => void;
}> {
  render() {
    const { stageId, stageAge, items, options, onRemoveItem } = this.props;

    return items.map((item, index: number) => (
      <DraggableContainerWithRouter
        key={item._id}
        stageId={stageId}
        stageAge={stageAge}
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
  stageAge?: number;
  items: IItem[];
  options: IOptions;
  onRemoveItem: (itemId: string, stageId: string) => void;
};

class InnerList extends React.PureComponent<InnerListProps> {
  render() {
    const { stageId, stageAge, items, dropProvided, options, onRemoveItem } =
      this.props;

    if (items.length === 0) {
      return (
        <EmptyContainer ref={dropProvided.innerRef}>
          <EmptyState icon="postcard" text="No item" size="small" />
        </EmptyContainer>
      );
    }

    return (
      <DropZone ref={dropProvided.innerRef}>
        <InnerItemList
          onRemoveItem={onRemoveItem}
          stageId={stageId}
          stageAge={stageAge}
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
    listId: "LIST",
  };

  render() {
    const {
      ignoreContainerClipping,
      listId,
      style,
      stageId,
      stageAge,
      items,
      options,
      onRemoveItem,
    } = this.props;

    return (
      <Droppable
        droppableId={listId}
        ignoreContainerClipping={ignoreContainerClipping}
      >
        {(dropProvided, dropSnapshot) => (
          <Wrapper
            style={style}
            $isDraggingOver={dropSnapshot.isDraggingOver}
            {...dropProvided.droppableProps}
          >
            <InnerList
              onRemoveItem={onRemoveItem}
              stageId={stageId}
              stageAge={stageAge}
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
