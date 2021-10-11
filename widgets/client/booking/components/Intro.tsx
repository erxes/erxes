import * as React from 'react';
import { readFile } from '../../utils';
import { IBooking } from '../types';
import Button from './common/Button';
import Body from './common/Body'
type Props = {
  booking: IBooking;
  goToBooking: (booking: IBooking) => void;
};

function Intro({ booking, goToBooking }: Props) {
  const { title, description, image, styles } = booking;
  const { widgetColor } = styles;

  return (
    <>
      <Body page="intro" title={title} description={description} image={image} />
      <div className="flex-end">
      <Button
          text="Next"
          onClickHandler={() => goToBooking(booking)}
          style={{ backgroundColor: widgetColor }}
        />
      </div>
       
    </>
  );
}

export default Intro;
