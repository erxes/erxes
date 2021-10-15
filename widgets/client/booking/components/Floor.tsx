import * as React from 'react';
import { IBookingData, IProductCategory } from '../types';
import { readFile } from '../../utils';
import Button from './common/Button';

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
    <div className="grid-13 mt-30">
      <div className="detail">
        <div className="flex-center b mb-10"> Penthouse</div>
        <div className="flex-center mb-10">
          Please select your preffered floor
        </div>
        <div className="flex-center">
          <img
            src={readFile(floor.attachment.url)}
            alt="hello"
            style={{ maxHeight: '500px' }}
          />
        </div>
      </div>

      <div className="flex-start">
        <Button
          text="Back"
          onClickHandler={goToBookings}
          style={{ backgroundColor: widgetColor }}
        />
      </div>
    </div>
  );
}

export default Floor;
