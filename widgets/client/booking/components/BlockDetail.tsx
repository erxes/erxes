import * as React from 'react';
import { ICategoryTree, IProductCategory } from '../types';
import { BackButton } from './common';
import FilterableList from './common/FilterableList';

type Props = {
  goToBookings: () => void;
  block: IProductCategory | null;
};

function BlockDetail({ goToBookings }: Props) {
  return (
    <div>
      <BackButton onClickHandler={goToBookings} />
    </div>
  );
}

export default BlockDetail;
