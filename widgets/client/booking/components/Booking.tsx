import * as React from 'react';
import { IBookingData } from '../types';
import { Block } from '../containers';
import Button from './common/Button';
import Body from './common/Body';

type Props = {
  goToIntro: () => void;
  goToFloor?: () => void;
  booking: IBookingData | null;
};

function Booking({ goToIntro, booking }: Props) {
  if (!booking) {
    return null;
  }

  const {
    childCategories,
    mainProductCategory,
    style
  } = booking;
  const { name, attachment, description } = mainProductCategory;
  let { widgetColor, line, columns, rows, margin } = style;

  const blockCount = childCategories.length;
  let column: string = columns!
  let colCount = parseInt(column) >= 4 ? "4" : columns;

  const blocksStyle = {
    width: "100%",
    display: "grid",
    marginTop: "10px",
    gridTemplateColumns: `repeat(${colCount}, 1fr)`,
    gridAutoColumns: "minmax(100px, auto)",
    gap: margin,
  };

  let hover = false;
  let hoverStyle = { borderColor: "", color: "" };

  const toggleHover = () => {
    hover = !hover;
    if (hover === true) {
      hoverStyle.borderColor = widgetColor;
      hoverStyle.color = widgetColor
    }
  }

  return (
    <>
      <Body
        page="booking"
        title={name}
        description={description}
        image={attachment}
      >
        <div style={blocksStyle}>
          {childCategories.map((block, index) => {
            return (
              <Block key={index} block={block} widgetColor={widgetColor} />
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
