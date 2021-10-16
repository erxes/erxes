import * as React from 'react';
import { IBookingData } from '../types';
import Button from './common/Button';
import Body from './common/Body';
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
    <>
      <Body
        page="block"
        title={block.name}
        description={block.description}
        image={block.attachment}
      />
      <div className="footer">
        <Button
          text="Back"
          onClickHandler={goToBookings}
          style={{ backgroundColor: widgetColor }}
        />
      </div>
    </>
  );
}

export default BlockDetail;
