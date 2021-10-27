import * as React from 'react';
import { IBookingData } from '../types';
import Button from './common/Button';
import { IProductCategory } from '../../types';
import { readFile } from '../../utils';

type Props = {
  goToBookings: () => void;
  category?: IProductCategory;
  booking?: IBookingData;
};

function CategoryDetail({ goToBookings, category, booking }: Props) {
  if (!category || !booking) {
    return null;
  }

  const { categoryTree } = booking;
  const { widgetColor } = booking.style;

  // use this
  const childCategories = categoryTree.filter(
    tree => tree.parentId === category._id && tree.type === 'category'
  );

  return (
    <>
      <div className="body">
        <h4> {category.name} </h4>
        <p> {category.description} </p>
        <div className="grid-12">
          <div>
            <img
              src={readFile(category.attachment && category.attachment.url)}
              alt={category.attachment && category.attachment.title}
              style={{
                maxHeight: '100%',
                maxWidth: '100%'
              }}
            />
          </div>
        </div>
      </div>
      <div />
      <div className="footer">
        <Button
          text={'Back'}
          type="back"
          onClickHandler={goToBookings}
          style={{ backgroundColor: widgetColor }}
        />
        <Button
          text={'Next'}
          type="back"
          onClickHandler={goToBookings}
          style={{ backgroundColor: widgetColor }}
        />
      </div>
    </>
  );
}

export default CategoryDetail;
