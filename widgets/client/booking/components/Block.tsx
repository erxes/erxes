import * as React from 'react';
import { IBooking, IProductCategory } from '../types';

type Props = {
  block: IProductCategory;
  widgetColor:string;
  goToBlock: (blockId: string) => void;
};

function Block({ block, widgetColor, goToBlock }: Props) {
  const handleOnClick = () => {
    goToBlock(block._id);
  };
  return (
    <div className={`block`} style={{ borderColor: widgetColor }} onClick={handleOnClick}>
      <h4>{block.name}</h4>
      <p>{block.description}</p>
    </div>
  );
}

export default Block;
