import * as React from 'react';
import { IProductCategory } from '../../types';
import { IStyle } from '../types';

type Props = {
  block: IProductCategory;
  widgetColor: string;
  goToBlock: (blockId: string) => void;
};

function Block({ block, widgetColor, goToBlock }: Props) {
  const handleOnClick = () => {
    goToBlock(block._id);
  };

  let hover = false

  const hoverStyle = {
    borderColor: widgetColor,
    color: widgetColor
  }
  return (
    <div className={`block`} onClick={handleOnClick} onMouseEnter={() => hover = true} onMouseLeave={() => hover = false}
      style={{ ...(hover ? hoverStyle : null) }}>
      <h4>{block.name}</h4>
      <p>{block.description}</p>
    </div>
  );
}

export default Block;
