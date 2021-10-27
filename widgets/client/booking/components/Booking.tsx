import * as React from 'react';
import { IBookingData } from '../types';
import { Card } from '../containers';
import Button from './common/Button';
import Body from './common/Body';

type Props = {
  goToIntro: () => void;
  booking: IBookingData | null;
};

function Booking({ goToIntro, booking }: Props) {
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

  const type = name || 'Блок';
  const column: string = columns!;
  // tslint:disable-next-line: radix
  const colCount = parseInt(column) >= 4 ? '4' : columns;

  const categoriesStyle = {
    marginTop: '10px',
    gridTemplateColumns: `repeat(${colCount}, minmax(120px, 1fr))`,
    gap: margin
  };

  let hover = false;
  const hoverStyle = { borderColor: '', color: '' };

  const toggleHover = () => {
    hover = !hover;
    if (hover === true) {
      hoverStyle.borderColor = widgetColor;
      hoverStyle.color = widgetColor;
    }
  };

  return (
    <>
      <Body
        page="booking"
        title={name}
        description={description}
        image={attachment}
      >
        <div className="items" style={categoriesStyle}>
          {childCategories.map(({}, index) => {
            return (
              <Card
                key={index.toString()}
                type={type}
                widgetColor={widgetColor}
              />
            );
          })}
        </div>
      </Body>
      <div className="footer">
        <Button
          text="Back"
          type="back"
          onClickHandler={() => goToIntro()}
          style={{ backgroundColor: style.widgetColor }}
        />
      </div>
    </>
  );
}

export default Booking;
