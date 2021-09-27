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
    <div className="intro-container">
      <h1>{title}</h1>
      <p>{description}</p>
      <img height="300" src={readFile(image.name)} alt="hello" />
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
