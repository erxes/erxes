import * as React from 'react';
import { IBooking, IProductCategory } from '../types';
import { readFile } from '../../utils';
import Button from './common/Button';
import Body from './common/Body'

type Props = {
  goToBookings: () => void;
  block?: IProductCategory;
  booking?: IBooking;
};

function BlockDetail({ goToBookings, block, booking }: Props) {
  if (!block || !booking) {
    return null;
  }
  const { widgetColor } = booking.styles;

  return (
    <>
    <Body page="block" title={block.name} description={block.description}  image={block.attachment} />
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
