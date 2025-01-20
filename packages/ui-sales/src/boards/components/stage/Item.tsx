import * as routerUtils from "@erxes/ui/src/utils/router";

import { IItem, IOptions } from "../../types";
import { ItemContainer, NotifiedContainer } from "../../styles/common";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import EditForm from "../../containers/editForm/EditForm";
import { IDeal } from "../../../deals/types";
import Icon from "@erxes/ui/src/components/Icon";
import queryString from "query-string";

type Props = {
  stageId?: string;
  item: IDeal | IItem;
  beforePopupClose?: () => void;
  onClick?: () => void;
  options: IOptions;
  itemRowComponent?: any;
  groupType?: string;
  groupObj?: any;
  dragSnapshot?: any;
  dragProvided?: any;
  hasNotified?: boolean;
  isOld?: boolean;
};

const Item: React.FC<Props> = (props) => {
  const {
    item,
    groupObj,
    options,
    stageId,
    itemRowComponent,
    isOld,
    hasNotified,
    beforePopupClose,
    dragSnapshot,
    dragProvided,
  } = props;

  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const itemIdQueryParam = routerUtils.getParam(location, "itemId");
    setIsFormVisible(
      itemIdQueryParam === `${item._id}${groupObj ? groupObj._id : ""}`
    );

    const unlisten = () => {
      const queryParams = queryString.parse(location.search);
      if (queryParams.itemId === `${item._id}${groupObj ? groupObj._id : ""}`) {
        setIsFormVisible(true);
      }
    };

    return () => {
      unlisten();
    };
  }, [item._id, groupObj, navigate, location]);

  const handleBeforePopupClose = (afterPopupClose?: () => void) => {
    setIsFormVisible(false);

    const itemIdQueryParam = routerUtils.getParam(location, "itemId");
    if (itemIdQueryParam) {
      routerUtils.removeParams(navigate, location, "itemId", "isFull");
    }

    if (beforePopupClose) {
      beforePopupClose();
    }

    if (afterPopupClose) {
      afterPopupClose();
    }
  };

  const renderHasNotified = () => {
    if (hasNotified) {
      return null;
    }

    return (
      <NotifiedContainer>
        <Icon icon="bell" size={14} />
      </NotifiedContainer>
    );
  };

  const renderForm = () => {
    if (!isFormVisible) {
      return null;
    }

    return (
      <EditForm
        {...props}
        stageId={stageId || item.stageId}
        itemId={item._id}
        hideHeader={true}
        isPopupVisible={isFormVisible}
        beforePopupClose={handleBeforePopupClose}
      />
    );
  };

  const ItemComponent = itemRowComponent || options.Item;

  return (
    <>
      <ItemContainer
        $isDragging={dragSnapshot.isDragging}
        $isOld={isOld}
        ref={dragProvided.innerRef}
        {...dragProvided.draggableProps}
        {...dragProvided.dragHandleProps}
      >
        {renderHasNotified()}
        <ItemComponent {...props} beforePopupClose={handleBeforePopupClose} />
      </ItemContainer>
      {renderForm()}
    </>
  );
};

export default Item;
