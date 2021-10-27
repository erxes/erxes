import * as React from 'react';
import { IBookingData } from '../types';
import { readFile } from '../../utils';
import { IProduct } from '../../types';
import Button from './common/Button';

type Props = {
  product?: IProduct;
  booking: IBookingData;
  goToBookings: () => void;
  showPopup: () => void;
};

function Product({ product, booking, goToBookings, showPopup }: Props) {
  if (!product || !booking) {
    return null;
  }
  const { widgetColor } = booking.style;
  const customFieldsDataWithText = product.customFieldsDataWithText || [];

  const showFull = (img: any) => {
    const image = document.getElementById('img-active') as HTMLImageElement;
    if (image) {
      image.src = readFile(img && img.url);
    }
  };

  const renderFieldData = () =>
    customFieldsDataWithText.map((el: any, index: any) => (
      // tslint:disable-next-line: jsx-key
      <div key={index}>
        <strong>{el.text}:</strong> {el.value}
      </div>
    ));

  const scrollPerClick = 200;
  let scrollAmount = 0;

  const moveCarousel = (orientation: string) => {
    const carousel = document.getElementById('carousel') as HTMLElement;

    if (orientation === 'left') {
      carousel.scrollTo({
        top: 0,
        left: scrollAmount -= scrollPerClick,
        behavior: 'smooth'
      });

      if (scrollAmount < 0) {
        scrollAmount = 0;
      }
    }

    if (orientation === 'right') {
      if (scrollAmount <= carousel.scrollWidth - carousel.clientWidth) {
        carousel.scrollTo({
          top: 0,
          left: scrollAmount += scrollPerClick,
          behavior: 'smooth'
        });
      } else {
        carousel.scrollTo({
          top: 0,
          left: scrollAmount = -scrollPerClick,
          behavior: 'smooth'
        });
      }
    }
  };

  return (
    <div className="container">
      <h4>{product.name}</h4>
      <p>{product.description}</p>
      <div className="flex-sa">
        <div className="slider w-50">
          <div className="active flex-center">
            <img
              id="img-active"
              src={readFile(product.attachment && product.attachment.url)}
              alt={product.attachment && product.attachment.name}
            />
          </div>
          <div className="flex-center">
            {product.attachmentMore && product.attachmentMore.length > 0 ? (
              "<"
            ) : (
              ''
            )}
            <div id="carousel">
              {(product.attachmentMore || []).map((img, index) => (
                <div
                  className="slider-item flex-center"
                  key={index}
                  onClick={() => showFull(img)}
                >
                  <img
                    id={img && img.name}
                    src={readFile(img && img.url)}
                    alt={img && img.name}
                  />
                </div>
              ))}
            </div>
            {product.attachmentMore && product.attachmentMore.length > 0 ? (
              ">"
            ) : (
              ''
            )}
          </div>
        </div>
        <div>
          <div>
            <strong>Price per unit:</strong> {product.unitPrice}
          </div>
          {renderFieldData()}
        </div>
      </div>

      <div className="footer">
        <Button
          text="Back"
          type="back"
          onClickHandler={goToBookings}
          style={{ backgroundColor: widgetColor, left: 0 }}
        />
        <Button
          text={'Book product'}
          type=""
          onClickHandler={() => showPopup()}
          style={{ backgroundColor: widgetColor, marginTop: '100px' }}
        />
      </div>
    </div>
  );
}

export default Product;
