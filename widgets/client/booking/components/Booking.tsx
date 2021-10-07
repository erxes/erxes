import * as React from 'react';
import { readFile } from '../../utils';
import { IBooking } from '../types';
import { Block } from '../containers';
import Button from './common/Button';

type Props = {
  goToIntro: () => void;
  goToFloor?: () => void;
  booking: IBooking | null;
};

function Booking({ goToIntro, booking }: Props) {
  if (!booking) {
    return null;
  }

  const {
    title,
    description,
    childCategories,
    mainProductCategory,
    styles
  } = booking;
  const { attachment } = mainProductCategory;
  const { widgetColor } = styles;

  return (
    <div className="main-container">
      <div className="main-header">
        <h3>{title}</h3>
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
