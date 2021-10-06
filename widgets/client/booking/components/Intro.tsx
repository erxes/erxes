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
    <div className="main-container">
      <div className="main-header">
        <h3>{title}</h3>
        {description}
      </div>
      <div className="main-body">
        <img src={readFile(attachment.url)} alt="hello" />
      </div>
      <button className="btn btn-next"
        onClick={() => goToBooking(booking)}
      >
        Next
      </button>
    </div>
  );
}

export default Intro;
