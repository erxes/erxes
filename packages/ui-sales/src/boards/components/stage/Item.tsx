import * as routerUtils from "@erxes/ui/src/utils/router";

import { IItem, IOptions } from "../../types";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { IDeal } from "../../../deals/types";
import Icon from "@erxes/ui/src/components/Icon";
import { NotifiedContainer } from "../../styles/common";
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
  hasNotified?: boolean;
};

const Item: React.FC<Props> = (props) => {
  const {
    item,
    groupObj,
    options,
    itemRowComponent,
    hasNotified,
    beforePopupClose,
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

  const ItemComponent = itemRowComponent || options.Item;

  return (
    <ItemComponent
      {...props}
      beforePopupClose={handleBeforePopupClose}
      isFormVisible={isFormVisible}
    />
  );
};

export default Item;
