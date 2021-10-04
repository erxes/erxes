import * as React from 'react';
import { readFile } from '../../utils';
import { IBooking } from '../types';
import { Block } from '../containers';

type Props = {
  goToIntro: () => void;
  booking: IBooking | null;
};

function Booking({ goToIntro, booking }: Props) {
  if (!booking) {
    return null;
  }

  const { title, description, childCategories, mainProductCategory } = booking;
  const { attachment } = mainProductCategory;

  return (
    <div className="main-container">
      <div className="main-header">
        <h3>{title}</h3>
        {description}
      </div>
      <div className="main-body">
        <img src={readFile(attachment.url)} alt={attachment.name} />
        <button
          className="erxes-button back-button"
          onClick={() => goToIntro()}
        >
          Back
        </button>
      </div>
      <div className="block-container">
        {childCategories.map((block, index) => {
          return <Block key={index} block={block} />;
        })}
      </div>
    </div>
  );
}

export default Booking;
