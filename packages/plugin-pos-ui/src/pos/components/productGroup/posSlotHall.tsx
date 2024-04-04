import React from 'react';
import { Hall, HallContainer } from '../../../styles';
import PosSlotHallItem from './posSlotHallItem';

const PosSlotHall = ({
  handleBack,
  slots,
  handleChange,
  activeSlot,
  setActiveSlot
}) => {
  return (
    <HallContainer>
      <Hall>
        <div className="background" onClick={handleBack} />
        {slots.map(sl => (
          <PosSlotHallItem
            {...sl}
            key={sl._id}
            handleChange={handleChange}
            active={sl._id === activeSlot}
            setActiveSlot={setActiveSlot}
          />
        ))}
      </Hall>
    </HallContainer>
  );
};

export default PosSlotHall;
