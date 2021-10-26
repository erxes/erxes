import * as React from 'react';
import { IBookingData } from '../types';
import Button from './common/Button';
import Apartment from './common/Card';
import { IProductCategory } from '../../types';
import { readFile } from "../../utils"

type Props = {
  floor?: IProductCategory;
  goToBookings: () => void;
  booking: IBookingData;
};

function Floor({ floor, goToBookings, booking }: Props) {
  if (!floor || !booking) {
    return null;
  }

  const { widgetColor } = booking.style;
  const { name, description, status, attachment } = floor

  const davhruud = [{ uruu: "56mkv" }, { uruu: "56mkv" }]

  const type = name || "Өрөө";

  const floors = davhruud.map((el) =>
    <Apartment type={type} widgetColor={widgetColor} key={el.uruu.toString()} status={status} />
  );
  return (
    <>
      <div className="body">
        <h4> {name} </h4>
        <p> {description} </p>
        <div className="grid-12">
          <div className="items">{floors}</div>
          <div>
            <img
              src={readFile(attachment && attachment.url)}
              alt={floor.attachment.title}
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
      <div className="footer flex-start">
        <Button
          text={"Back"}
          type="back"
          onClickHandler={goToBookings}
          style={{ backgroundColor: widgetColor }}
        />
      </div>
    </>
  );
}

export default Floor;
