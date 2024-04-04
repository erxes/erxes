import React from 'react';
import ResizableRect from '../slot';

const PosSlotHallItem = ({
  handleChange,
  _id,
  active,
  setActiveSlot,
  name,
  option
}: any) => {
  const handleResize = style => {
    // type is a string and it shows which resize-handler you clicked
    // e.g. if you clicked top-right handler, then type is 'tr'
    let { top, left, width, height } = style;
    top = Math.round(top);
    left = Math.round(left);
    width = Math.round(width);
    height = Math.round(height);
    handleChange(
      {
        top,
        left,
        width,
        height
      },
      _id
    );
  };

  const handleRotate = rotateAngle => {
    handleChange(
      {
        rotateAngle
      },
      _id
    );
  };

  const handleDrag = (deltaX, deltaY) => {
    handleChange(
      {
        left: option.left + deltaX,
        top: option.top + deltaY
      },
      _id
    );
  };

  return (
    <ResizableRect
      {...option}
      zoomable="n, w, s, e, nw, ne, se, sw"
      onRotate={handleRotate}
      rotatable={true}
      onResize={handleResize}
      onDrag={handleDrag}
      onDragStart={() => setActiveSlot(_id)}
      active={active}
    >
      {name}
    </ResizableRect>
  );
};

export default PosSlotHallItem;
