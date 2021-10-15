import * as React from 'react';
import { readFile } from '../../utils';
import { IBookingData } from '../types';
import Button from './common/Button';

type Props = {
  booking: IBookingData;
  goToBooking: (booking: IBookingData) => void;
  showPopup: () => void;
};

function Intro({ booking, goToBooking, showPopup }: Props) {
  const { name, description, image, style } = booking;
  const { widgetColor } = style;

  return (
    <div className="main-container">
      <div className="main-header">
        <h3>{name}</h3>
        {description}
      </div>
      <div className="main-body">
        <img src={readFile(image && image.url)} alt={name} />
      </div>
      <div className="flex-end">
        <Button
          text="Next"
          onClickHandler={() => showPopup()}
          style={{ backgroundColor: widgetColor }}
        />
      </div>
    </div>
  );
}

export default Intro;
