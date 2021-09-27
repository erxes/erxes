import * as React from 'react';
import { IProductCategory } from '../types';
import { BackButton } from './common';

type Props = {
  floors: IProductCategory[];
  goToBookings: () => void;
};

function BlockDetail({ floors, goToBookings }: Props) {
  return (
    <div>
      {floors.map((floor, index) => {
        return <h1 key={index}>{floor.name}</h1>;
      })}
      <BackButton onClickHandler={goToBookings} />
    </div>
  );
}

export default BlockDetail;
