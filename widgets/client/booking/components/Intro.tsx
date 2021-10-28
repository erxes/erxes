import * as React from 'react';
import { IBookingData } from '../types';
import Button from './common/Button';
import { readFile, __ } from '../../utils';

type Props = {
  booking: IBookingData;
  goToBooking: (booking: IBookingData) => void;
};

function Intro({ booking, goToBooking }: Props) {
  const { name, image, style } = booking;
  const { widgetColor } = style;

  const description = booking.description.replace(/<\/?[^>]+(>|$)/g, "")

  return (
    <div className="container" style={{ overflow: 'hidden' }}>
      <h4> {name}</h4>
      <p> {description} </p>
      <div className="img-container flex-center">
        <img src={readFile(image && image.url)} alt={'s'} />
      </div>

      <div className="footer">
        <Button
          text={__('Next')}
          type="next"
          onClickHandler={() => goToBooking(booking)}
          style={{ backgroundColor: widgetColor, right: 0 }}
        />
      </div>
    </div>
  );
}

export default Intro;
