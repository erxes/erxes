import * as React from 'react';
import { IBookingData } from '../types';
import { Card } from '../containers';
import Button from './common/Button';
import { readFile } from "../../utils"
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

  console.log(childCategories)

  const block = name || 'Блок';
  const blockDescription = name || 'Блок';
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

  console.log(childCategories)

  const toggleHover = () => {
    hover = !hover;
    if (hover === true) {
      hoverStyle.borderColor = widgetColor;
      hoverStyle.color = widgetColor;
    }
  };

  return (
    <div>
      <h4> {name}</h4>
      <p> {description} </p>

      <div className="category flex-center">
        <img
          src={readFile(attachment && attachment.url)}
          alt={'s'}
        />
      </div>

      <div className="items" style={categoriesStyle}>
        {childCategories.map(({ }, index) => {
          return (
            <Card
              key={index.toString()}
              type={block}
              description={blockDescription}
              widgetColor={widgetColor}
            />
          );
        })}
      </div>

      <div className="footer">
        <Button
          text="Back"
          type="back"
          onClickHandler={() => goToIntro()}
          style={{ backgroundColor: style.widgetColor }}
        />
      </div>
    </div>
  );
}

export default Booking;
