import * as React from 'react';
import { readFile } from '../../utils';
import { IBooking } from '../types';

type Props = {
  booking: IBooking;
  goToBooking: (booking: IBooking) => void;
};

function Intro({ booking, goToBooking }: Props) {
  const { title, description, mainProductCategory } = booking;
  const { attachment } = mainProductCategory;

  return (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
      <img
        src={readFile(attachment.url)}
        alt="hello"
        style={{ width: '900px' }}
      />
      <button
        style={{ backgroundColor: '#5629B6' }}
        className="erxes-button"
        onClick={() => goToBooking(booking)}
      >
        Next
      </button>
    </div>
  );
}

export default Intro;
