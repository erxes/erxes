import * as React from 'react';
import { IBookingData } from '../types';
import Card from './common/Card';
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
  const { columns, rows, line, margin } = style;

  const childCategories = categoryTree.filter(
    tree => tree.parentId === productCategoryId && tree.type === 'category'
  );

  const column: string = columns!;
  // tslint:disable-next-line: radix
  const colCount = parseInt(column) >= 4 ? '4' : columns;

  const gridStyle = {
    marginTop: '10px',
    gridTemplateColumns: `repeat(${colCount}, minmax(120px, 1fr))`,
    gap: margin
  };

  let selectedId = "";

  const goNext = (id: any) => {
    selectedId = id;
  };

  const Body = () => {
    return (
      <div className="body">
        <div style={{ maxHeight: "40vh" }} className="img-container">
          <img
            src={readFile(attachment && attachment.url)}
            alt={'s'}
          />
        </div>
        <div className="cards" style={gridStyle}>
          {childCategories.map((el) => {
            return (
              <div onClick={() => goNext(el._id)}>
                <Card
                  key={el._id}
                  title={el.name}
                  type={"main"}
                  description={"Desctiption"}
                  style={style}
                />
              </div>
            );
          })}
        </div>
      </div>
    )
  }

  const Footer = () => {
    return (
      <div className="footer">
        <Button
          text="Back"
          type="back"
          onClickHandler={() => goToIntro()}
          style={{ backgroundColor: style.widgetColor, left: 0 }}
        />
        <Button
          text="Next"
          type="next"
          onClickHandler={() => goToIntro()}
          style={{ backgroundColor: style.widgetColor, right: 0 }}
        />
      </div>
    )
  }

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
