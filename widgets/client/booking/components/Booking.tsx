import * as React from 'react';
import { readFile } from '../../utils';
import { IBookingData } from '../types';
import { Block } from '../containers';
import Button from './common/Button';

type Props = {
  goToIntro: () => void;
  goToFloor?: () => void;
  booking: IBookingData | null;
};

function Booking({ goToIntro, booking }: Props) {
  if (!booking) {
    return null;
  }

  const {
    name,
    description,
    childCategories,
    mainProductCategory,
    style
  } = booking;
  const { attachment } = mainProductCategory;
  const { widgetColor } = style;

  return (
    <div className="main-container">
      <div className="main-header">
        <h3>{name}</h3>
        {description}
      </div>
      <div className="main-body">
        <img
          src={readFile(attachment && attachment.url)}
          alt={attachment.name}
        />
      </div>
      <div className="w-100 flex-center">
        {childCategories.map((block, index) => {
          return <Block key={index} block={block} widgetColor={widgetColor} />;
        })}
      </div>

      {/* fooooooterrr  */}
      <div className="flex-sb w-100">
        <Button
          text="Back"
          onClickHandler={() => goToIntro()}
          style={{ backgroundColor: widgetColor }}
        />
      </div>
    </div>
  );
}

export default Booking;
