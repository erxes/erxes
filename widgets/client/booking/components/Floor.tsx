import * as React from 'react';
import { IBooking, IProductCategory } from '../types';
import { readFile } from '../../utils';
import Button from './common/Button';
import Body from '../components/common/Body'

type Props = {
  floor?: IProductCategory;
  goToBookings: () => void;
  booking: IBooking;
};

function Floor({ floor, goToBookings, booking }: Props) {
  if (!floor || !booking) {
    return null;
  }

  const { widgetColor } = booking.styles;

  return (
    <>
      <Body page="floor" title={"Penthouse"} description={" Please select your preffered floor"} image={floor.attachment}/>
      <div className="flex-start">
        <Button
          text="Back"
          onClickHandler={goToBookings}
          style={{ backgroundColor: widgetColor }}
        />
      </div>
    </>
  );
}

export default Floor;
