import * as React from 'react';
import { IBookingData } from '../types';
import Button from './common/Button';
import { readFile, __ } from '../../utils';

type Props = {
  booking: IBookingData;
  goToBooking: (booking: IBookingData) => void;
  goToCategory: (categoryId: string) => void;
};

function Intro({ booking, goToBooking, goToCategory }: Props) {
  const { name, image, style, categoryTree } = booking;
  const { widgetColor } = style;

  const description = booking.description.replace(/<\/?[^>]+(>|$)/g, '');

  const hasCategory = categoryTree.some(tree =>
    tree.parentId !== booking.productCategoryId ? true : false
  );

  return (
    <>
      <div className="title text-center">
        <h4> {name}</h4>
        <p className="text-center"> {description} </p>
      </div>
      <div className="img-container flex-center">
        <img src={readFile(image && image.url)} alt={'s'} />
      </div>

      <div className="footer">
        <div className="flex-end">
          <Button
            text={__('Next')}
            type="next"
            onClickHandler={() =>
              hasCategory
                ? goToBooking(booking)
                : goToCategory(booking.productCategoryId)
            }
            style={{ backgroundColor: widgetColor }}
          />
        </div>
      </div>
    </>
  );
}

export default Intro;
