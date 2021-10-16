import * as React from 'react';
import { IBookingData } from '../types';
import { Block } from '../containers';
import Button from './common/Button';
import Body from './common/Body';

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
    <>
      <Body
        page="block"
        title={name}
        description={description}
        image={attachment}
      >
        <div className={`flex-sa`}>
          {childCategories.map((block, index) => {
            return (
              <Block key={index} block={block} widgetColor={widgetColor} />
            );
          })}
        </div>
      </Body>
      <div className="footer">
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
