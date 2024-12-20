import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import queryString from 'query-string';
import * as routerUtils from '@erxes/ui/src/utils/router';
import { IItem, IOptions } from '../../types';
import { IDeal } from '../../../deals/types';

type Props = {
  stageId?: string;
  item: IDeal | IItem;
  beforePopupClose?: () => void;
  onClick?: () => void;
  options: IOptions;
  itemRowComponent?: any;
  groupType?: string;
  groupObj?: any;
};

const Item: React.FC<Props> = props => {
  const { item, groupObj, options, itemRowComponent, beforePopupClose } = props;
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const itemIdQueryParam = routerUtils.getParam(location, 'itemId');
    setIsFormVisible(
      itemIdQueryParam === `${item._id}${groupObj ? groupObj._id : ''}`
    );

    const unlisten = () => {
      const queryParams = queryString.parse(location.search);
      if (queryParams.itemId === `${item._id}${groupObj ? groupObj._id : ''}`) {
        setIsFormVisible(true);
      }
    };

    return () => {
      unlisten();
    };
  }, [item._id, groupObj, navigate, location]);

  const handleBeforePopupClose = (afterPopupClose?: () => void) => {
    setIsFormVisible(false);

    const itemIdQueryParam = routerUtils.getParam(location, 'itemId');
    if (itemIdQueryParam) {
      routerUtils.removeParams(navigate, location, 'itemId');
    }

    if (beforePopupClose) {
      beforePopupClose();
    }

    if (afterPopupClose) {
      afterPopupClose();
    }
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
