import * as React from 'react';
import { IBookingData } from '../types';
import Card from './common/Card';
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
  const { columns, rows, line, margin } = style;

  const childCategories = categoryTree.filter(
    tree => tree.parentId === productCategoryId && tree.type === 'category'
  );

  const column: string = columns!;
  const colCount = parseInt(column, 10) >= 4 ? '4' : columns;

  const gridStyle = {
    marginTop: '10px',
    gridTemplateColumns: `repeat(${colCount}, minmax(120px, 1fr))`,
    gap: margin || '10px'
  };

  let selectedId = '';

  const selectCard = (el: any) => {
    selectedId = el._id;
    const count: string = el.count!;
    const status =
      el.status === 'disabled' || parseInt(count, 10) === 0 ? 'disabled' : '';

    setTimeout(() => {
      if (status !== 'disabled') {
        goToCategory(selectedId);
      }
    }, 100);
  };

  const Body = () => {
    return (
      <div className="body">
        <div className="img-container">
          <img
            src={readFile(attachment && attachment.url)}
            alt={booking.name}
          />
        </div>
        <div className="cards" style={gridStyle}>
          {childCategories.map(el => (
            <React.Fragment key={el._id}>
              <Card
                title={el.name}
                status={el.status}
                count={el.count}
                description={el.description}
                style={style}
                onClick={() => selectCard(el)}
                key={el._id}
              />
            </React.Fragment>
          ))}
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
          style={{ backgroundColor: style.widgetColor, left: 0 }}
        />
      </div>
    );
  };

  return (
    <>
      <div className="title text-center">
        <h4> {name}</h4>
        <p className="text-center"> {description} </p>
      </div>
      <Body />
      <Footer />
    </>
  );
}

export default Booking;
