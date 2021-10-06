import * as React from 'react';
import { readFile } from '../../utils';
import { IBooking } from '../types';
import { Block } from '../containers';

type Props = {
  goToIntro: () => void;
  goToFloor?: () => void;
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
      </div>
      <div className="w-100 flex-center">
        {childCategories.map((block, index) => {
          return <Block key={index} block={block} />;
        })}
      </div>


{/* fooooooterrr  */}
      <div className="flex-sb w-100">
      <button className="btn btn-back" onClick={() => goToIntro()}>
          <i className="icon-arrow-left"></i>
          Back
        </button>
        <button className="btn btn-next" onClick={() => goToIntro()}>
           Next
          <i className="icon-arrow-right"></i>
        </button>
      </div>
    </div>



  );
}

export default Booking;
