import dayjs from 'dayjs';
import Icon from '@erxes/ui/src/components/Icon';
import React from 'react';
import { __ } from '@erxes/ui/src/utils';
import { ItemDate } from '@erxes/ui-cards/src/boards/styles/common';
import { IItem } from '@erxes/ui-cards/src/boards/types';
import { Footer, Right } from '@erxes/ui-cards/src/boards/styles/item';

const footerInfo = item => {
  if (!item.isWatched && !item.number) {
    return __('Last updated');
  }

  return (
    <>
      {item.isWatched && <Icon icon="eye" />}
      {item.number}
    </>
  );
};

const renderDate = date => {
  if (!date) {
    return null;
  }

  return <ItemDate>{dayjs(date).format('lll')}</ItemDate>;
};

const ItemFooter = (props: { item: IItem }) => {
  const { item } = props;
  return (
    <Footer>
      {footerInfo(item)}
      <Right>{renderDate(item.modifiedAt)}</Right>
    </Footer>
  );
};

export default ItemFooter;
