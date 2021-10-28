import * as React from 'react';
import { IBookingData } from '../types';
import { Card } from '../containers';
import Button from './common/Button';
import { readFile, __ } from '../../utils';
type Props = {
  goToIntro: () => void;
  booking: IBookingData | null;
  goToCategory: (categoryId: string) => void;
};

function Booking({ goToIntro, booking, goToCategory }: Props) {
  if (!booking) {
    return null;
  }

  const {
    mainProductCategory,
    style,
    categoryTree,
    productCategoryId
  } = booking;

  const { name, attachment, description } = mainProductCategory;
  const { widgetColor, line, columns, rows, margin } = style;

  const childCategories = categoryTree.filter(
    tree => tree.parentId === productCategoryId && tree.type === 'category'
  );

  const column: string = columns!;
  // tslint:disable-next-line: radix
  const colCount = parseInt(column) >= 4 ? '4' : columns;

  const categoriesStyle = {
    marginTop: '10px',
    gridTemplateColumns: `repeat(${colCount}, minmax(120px, 1fr))`,
    gap: margin
  };

  const Body = () => {
    return (
      <div className="body">
        <div className="img-container sub flex-center">
          <img src={readFile(attachment && attachment.url)} alt={'s'} />
        </div>
        <div className="cards" style={categoriesStyle}>
          {childCategories.map(el => {
            return (
              <div onClick={() => goToCategory(el._id)}>
                <Card
                  key={el._id}
                  title={el.name}
                  type={'main'}
                  description={'Desctiption'}
                  widgetColor={widgetColor}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const Footer = () => {
    return (
      <div className="footer">
        <Button
          text={__('Back')}
          type="back"
          onClickHandler={() => goToIntro()}
          style={{ backgroundColor: style.widgetColor }}
        />
        <Button
          text={__('Next')}
          type="next"
          onClickHandler={() => goToIntro()}
          style={{ backgroundColor: style.widgetColor }}
        />
      </div>
    );
  };

  return (
    <div className="container">
      <h4> {name}</h4>
      <p> {description} </p>
      <Body />
      <Footer />
    </div>
  );
}

export default Booking;
