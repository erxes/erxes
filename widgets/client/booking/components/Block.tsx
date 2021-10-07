import * as React from 'react';
import { IProductCategory } from '../types';

type Props = {
  block: IProductCategory;
  goToBlock: (blockId: string) => void;
};

function Block({ block, goToBlock }: Props) {
  const handleOnClick = () => {
    goToBlock(block._id);
  };

  const widgetColor = '#4bbf6b'

  return (
    <div className={`block border-${widgetColor}`} onClick={handleOnClick}>
      <h4>{block.name}</h4>
      <p>{block.description}</p>
    </div>
  );
}

export default Block;
