import * as React from 'react';
import { readFile } from '../../utils';
import { IBooking } from '../types';
import Button from './common/Button';

type Props = {
  booking: IBooking;
  goToBooking: (booking: IBooking) => void;
};

function Intro({ booking, goToBooking }: Props) {
  const { title, description, image, styles } = booking;
  const { widgetColor } = styles;

  return (
    <div className="main-container">
      <div className="main-header">
        <h3>{title}</h3>
        {description}
      </div>
      <div className="main-body">
        <img src={readFile(image && image.url)} alt={title} />
      </div>
      <div className="flex-end">
        <Button
          text="Next"
          onClickHandler={() => goToBooking(booking)}
          style={{ backgroundColor: widgetColor }}
        />
      </div>
    </div>
  );
}

export default Intro;
