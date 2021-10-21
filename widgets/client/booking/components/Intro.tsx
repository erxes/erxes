import * as React from 'react';
import { IBookingData } from '../types';
import Button from './common/Button';
import Body from './common/Body';
type Props = {
  booking: IBookingData;
  goToBooking: (booking: IBookingData) => void;
};

function Intro({ booking, goToBooking }: Props) {
  const { name, description, image, style } = booking;
  const { widgetColor } = style;

  return (
    <>
      <Body page="intro" title={name} description={description} image={image} />
      <div className="footer">
        <Button
          text="Next"
          type="next"
          onClickHandler={() => goToBooking(booking)}
          style={{ backgroundColor: widgetColor, right: 0 }}
        />
      </div>
    </>
  );
}

export default Intro;
