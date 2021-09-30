import * as React from 'react';
import { readFile } from '../../utils';
import { IBooking } from '../types';
import { Block } from '../containers';
import { BackButton } from './common';

type Props = {
  goToIntro: () => void;
  booking: IBooking | null;
};

function Booking({ goToIntro, booking }: Props) {
  if (!booking) {
    return null;
  }

  const { title, description, image, childCategories } = booking;

  return (
    <div>
      <h1>{title}</h1>
      <p>{description}</p>
      <img height={300} src={readFile(image.url)} alt={image.name} />
      {childCategories.map((block, index) => {
        return <Block key={index} block={block} />;
      })}
      <BackButton onClickHandler={goToIntro} />
    </div>
  );
}

export default Booking;
