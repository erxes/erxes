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
  const style = booking.style;
  const description = category.description && category.description.replace(/<\/?[^>]+(>|$)/g, "")

  // use this
  const childCategories = categoryTree.filter(
    tree => tree.parentId === category._id && tree.type === 'category'
  );

  const wrapperstyle = childCategories.length > 6 ? "cards" : "flex-cards"

  let selectedId = "";

  const goNext = (id: any) => {
    selectedId = id;
  };

  return (
    <>
      <div className="container">
        <h4> {category.name} </h4>
        <p> {description} </p>
        <div className="flex-sa">
          <div className="img-container w-50">
            <img
              src={readFile(category.attachment && category.attachment.url)}
              alt={category.attachment && category.attachment.title}
              style={{
                maxHeight: '100%',
                maxWidth: '100%'
              }}
            />n
          </div>
          <div className={wrapperstyle}>
            {childCategories.map((el, i = 1) => {
              return (
                <div onClick={() => goNext(el._id)} className={wrapperstyle}>
                  <Card
                    key={i}
                    type={"category"}
                    title={el.name}
                    style={style}
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
          style={{ backgroundColor: style.widgetColor }}
        />
        <Button
          text={'Next'}
          type="back"
          onClickHandler={goToBookings}
          style={{ backgroundColor: style.widgetColor }}
        />
      </div>
    </>
  );
}

export default CategoryDetail;
