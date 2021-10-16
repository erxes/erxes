import * as React from 'react';
import { IBookingData } from '../types';
import Slider from 'react-slick';
import { readFile } from '../../utils';
import Button from './common/Button';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { IProduct } from '../../types';

type Props = {
  product?: IProduct;
  booking: IBookingData;
  goToBookings: () => void;
  showForm: () => void;
  showPopup: () => void;
};

function Product({
  product,
  booking,
  goToBookings,
  showForm,
  showPopup
}: Props) {
  if (!product || !booking) {
    return null;
  }

  const { widgetColor } = booking.style;

  const showFull = (img: any) => {
    const image = document.getElementById('img-active') as HTMLImageElement;
    if (image) {
      image.src = readFile(img && img.url);
    }
  };

  const renderDetail = () => {
    // console.log(product)
    // const {sku, customFieldsDataWithText, } = product;

    // if(customFieldsDataWithText){

    //       return <div>
    //          <span>{`Id is: ${}`}</span>
    //          <span>{`Name is: `}</span>
    //       </div>

    // }

    return <div>vhjk</div>;
  };

  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 2000,
    slidesToShow: 3,
    slidesToScroll: 1
  };

  return (
    <div className="product">
      <h4>{product.name}</h4>
      <p>{product.description}</p>

      <div className="grid-21">
        <div className="slider">
          <div className="active">
            <img
              id="img-active"
              src={readFile(product.attachment && product.attachment.url)}
              alt={product.attachment.name}
            />
          </div>
          <div>
            <Slider {...settings}>
              {product.attachmentMore?.map((img: any) => (
                // tslint:disable-next-line: jsx-key
                <div onClick={() => showFull(img)}>
                  {' '}
                  <img
                    id={img.name}
                    src={readFile(img && img.url)}
                    alt={img.name}
                  />{' '}
                </div>
              ))}
            </Slider>
          </div>
        </div>
        <div className="detail">{renderDetail}</div>
      </div>

      <div className="footer flex-sb">
        <Button
          text="Back"
          onClickHandler={goToBookings}
          style={{ backgroundColor: widgetColor }}
        />
        <Button
          text={'Захиалах'}
          onClickHandler={() => showPopup()}
          style={{ backgroundColor: widgetColor }}
        />
      </div>
    </div>
  );
}

export default Product;
