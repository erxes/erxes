import * as React from 'react';
import Button from './common/Button';
import Card from '../components/common/Card'
import { IBookingData } from '../types';
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

  let selectedId = "";

  const goNext = (id: any) => {
    selectedId = id;
  };

  return (
    <>
      <div className="container">
        <h4> {category.name} </h4>
        <p> {category.description} </p>
        <div className="flex-sa">
          <div className="img-container w-50">
            <img
              src={readFile(category.attachment && category.attachment.url)}
              alt={category.attachment && category.attachment.title}
              style={{
                maxHeight: '100%',
                maxWidth: '100%'
              }}
            />
          </div>
          <div className="cards w-50">
            {childCategories.map((el, i = 1) => {
              return (
                <div onClick={() => goNext(el._id)}>
                  <Card
                    key={i}
                    type={"category"}
                    title={el.name}
                    widgetColor={widgetColor}
                  />
                </div>
              );
            })}
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
