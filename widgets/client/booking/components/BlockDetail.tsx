import * as React from 'react';
import { IBookingData } from '../types';
import { readFile } from '../../utils';
import Button from './common/Button';
import { IProductCategory } from '../../types';

type Props = {
  goToBookings: () => void;
  block?: IProductCategory;
  booking?: IBookingData;
};

function BlockDetail({ goToBookings, block, booking }: Props) {
  if (!block || !booking) {
    return null;
  }

  const { widgetColor } = booking.style;

  return (
    <div className="main-container">
      <div className="main-header">
        <div className="flex-center b mb-10">{block.name}</div>
        <div className="flex-center mb-10">{block.description}</div>
        <div className="main-body">
          <img
            src={readFile(block.attachment && block.attachment.url)}
            alt="hello"
            style={{ maxHeight: '500px' }}
          />
        </div>
      </div>
      <div className="flex-sb w-100">
        <Button
          text="Back"
          onClickHandler={goToBookings}
          style={{ backgroundColor: widgetColor }}
        />
      </div>
    </div>
  );
}

export default BlockDetail;
