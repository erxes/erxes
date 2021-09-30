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
  return <button onClick={handleOnClick}>{block.name}</button>;
}

export default Block;
