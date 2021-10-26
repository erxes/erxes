import * as React from 'react';
import { IBookingData } from '../types';
import Button from './common/Button';
import Floor from './common/Card'
import { IProductCategory } from '../../types';
import { readFile } from '../../utils';

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

  const davhruud = [{ davhar: 1 }, { davhar: 2 }, { davhar: 3 }, { davhar: 1 }, { davhar: 1 }, { davhar: 1 }, { davhar: 1 }]
  const type = "Давхар"

  const floors = davhruud.map((el) =>
    <Floor type={type} widgetColor={widgetColor} key={el.davhar.toString()} />
  );
  return (
    <>
      <div className="body">
        <h4> {block.name} </h4>
        <p> {block.description} </p>
        <div className="grid-12">
          <div className="items">{floors}</div>
          <div>
            <img
              src={readFile(block.attachment && block.attachment.url)}
              alt={block.attachment.title}
              style={{
                maxHeight: '100%',
                maxWidth: '100%'
              }}
            />
          </div>
        </div>
      </div>
      <div>
      </div>
      <div className="footer">
        <Button
          text={"Back"}
          type="back"
          onClickHandler={goToBookings}
          style={{ backgroundColor: widgetColor }}
        />
        <Button
          text={"Next"}
          type="back"
          onClickHandler={goToBookings}
          style={{ backgroundColor: widgetColor }}
        />
      </div>
    </>
  );
}

export default BlockDetail;
