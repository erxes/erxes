import * as React from 'react';
import { readFile } from '../../utils';
import { IBooking } from '../types';

type Props = {
  booking: IBooking;
  goToBooking: (booking: IBooking) => void;
};

function Intro({ booking, goToBooking }: Props) {
  const { title, description, image , styles } = booking;
  const style = {
    itemShape: styles && styles.itemShape || "circle",
    productAvailable: styles && styles.productAvailable || "#4bbf6b",
    productSelected:styles && styles.productSelected || "#f47373",
    productUnavailable: styles && styles.productUnavailable || "#888",
    textAvailable: styles && styles.textAvailable || "#4bbf6b",
    textSelected: styles && styles.textSelected || "#f47373",
    textUnavailable: styles && styles.textUnavailable || "#AAA",
    widgetColor: styles && styles.widgetColor || "#4bbf6b"
  }
  
  return (
    <div className="main-container">
      <div className="main-header">
        <h3>{title}</h3>
        {description}
      </div>
      <div className="main-body">
        <img src={readFile(image && image.url)} alt={title} />
      </div>
      <button className={`btn bg-${style.widgetColor}`} onClick={() => goToBooking(booking)}>
        Next
      </button>
    </div>
  );
}

export default Intro;
