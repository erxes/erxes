import * as React from 'react';
import { IProductCategory } from '../types';
import { BackButton } from './common';

type Props = {
  goToBookings?: () => void;
  block?: IProductCategory;
};

function BlockDetail({ goToBookings, block }: Props) {
  if (!block) {
    return null;
  }
  return (
    <div>
      <h1>{block.name}</h1>
      {/* <BackButton onClickHandler={goToBookings} /> */}
    </div>
  );
}

export default BlockDetail;
