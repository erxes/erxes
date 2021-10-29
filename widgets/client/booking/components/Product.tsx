import * as React from 'react';
import { IBookingData } from '../types';
import { readFile, __ } from '../../utils';
import { IProduct } from '../../types';
import Button from './common/Button';

type Props = {
  product?: IProduct;
  booking: IBookingData;
  goToCategory: (categoryId: string) => void;
  showPopup: () => void;
};

function Product({ product, booking, goToCategory, showPopup }: Props) {
  if (!product || !booking) {
    return null;
  }
  const { widgetColor } = booking.style;
  const customFieldsDataWithText = product.customFieldsDataWithText || [];
  const description = product.description.replace(/<\/?[^>]+(>|$)/g, '');

  const showFull = (img: any) => {
    const image = document.getElementById('img-active') as HTMLImageElement;
    if (image) {
      image.src = readFile(img && img.url);
    }
  };

  const renderFieldData = () =>
    customFieldsDataWithText.map((el: any, index: any) => (
      // tslint:disable-next-line: jsx-key
      <p key={index}>
        <strong>{el.text}:</strong> {el.value}
      </p>
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

  const allAttachments = product.attachmentMore || [];
  allAttachments.push(product.attachment);

  const renderBtn = (type: string) => {
    return (
      <div className="btn-container">
        {allAttachments && allAttachments.length > 0 ? (
          <div
            onClick={() => moveCarousel(type)}
            className={`btn-move btn-move-${type}`}
          />
        ) : (
          ''
        )}
      </div>
    );
  };

  return (
    <div className="container">
      <h4>{product.name}</h4>
      <p>{description}</p>
      <div className="flex-sa">
        <div className="slider w-50">
          {renderBtn('left')}
          <div className="sliderWrapper">
            <div className="active flex-center">
              <img
                id="img-active"
                src={readFile(product.attachment && product.attachment.url)}
                alt={product.attachment && product.attachment.name}
              />
            </div>
            <div id="carousel">
              {(allAttachments || []).map((img, index) => (
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
          </div>

          {renderBtn('right')}
        </div>
        <div className="w-40">{renderFieldData()}</div>
      </div>

      <div className="footer">
        <Button
          text={__('Back')}
          type="back"
          onClickHandler={() => goToCategory(product.categoryId)}
          style={{ backgroundColor: widgetColor, left: 0 }}
        />
        <Button
          text={'Book product'}
          type=""
          onClickHandler={() => showPopup()}
          style={{ backgroundColor: widgetColor, right: 0 }}
        />
      </div>
    </div>
  );
}

export default Product;
