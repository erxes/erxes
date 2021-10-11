import * as React from 'react';
import { IBooking } from '../types';
import { Block } from '../containers';
import Button from './common/Button';
import Body from './common/Body'

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
    <>
        <>
        <Body page="block" title={title} description={description} image={attachment} />
        <div className="flex-center">
        {childCategories.map((block, index) => {
          return <Block key={index} block={block} widgetColor={widgetColor} />;
        })}
        </div>
        </>
        
        <div className="flex-sb">
        <Button
          text="Back"
          onClickHandler={() => goToIntro()}
          style={{ backgroundColor: widgetColor }}
        />
    </div>
    </>
  );
}

export default Booking;
