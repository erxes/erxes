import * as React from 'react';
import { readFile } from '../../utils';
import { IBooking } from '../types';

type Props = {
  booking: IBooking;
  onClick: (booking: IBooking) => void;
};

function Intro({ booking, onClick }: Props) {
  const { title, description, image } = booking;

  return (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
      <img src={readFile(image.url)} alt="hello" />
      <button
        style={{ backgroundColor: '#5629B6' }}
        className="erxes-button"
        onClick={() => onClick(booking)}
      >
        Next
      </button>
    </div>
  );
}

export default Intro;
