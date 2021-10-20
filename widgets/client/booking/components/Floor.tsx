import * as React from 'react';
import { IBookingData } from '../types';
import Button from './common/Button';
import { IProductCategory } from '../../types';
import Body from '../components/common/Body';

type Props = {
  floor?: IProductCategory;
  goToBookings: () => void;
  booking: IBookingData;
};

function Floor({ floor, goToBookings, booking }: Props) {
  if (!floor || !booking) {
    return null;
  }

  const { widgetColor } = booking.style;

  return (
    <>
      <Body
        page="floor"
        title={floor.name}
        description={floor.description}
        image={floor.attachment}
      />
      <div className="footer flex-start">
        <Button
          text="Back"
          type="back"
          onClickHandler={goToBookings}
          style={{ backgroundColor: widgetColor }}
        />
      </div>
    </>
  );
}

export default Floor;
