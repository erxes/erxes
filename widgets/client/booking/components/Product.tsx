import * as React from 'react';
import { IBooking, IProduct } from '../types';
import Slider from 'react-slick';
import { readFile } from '../../utils';
import Button from './common/Button';

type Props = {
  product?: IProduct;
  booking: IBooking;
  goToBookings: () => void;
};

function Product({ product, booking, goToBookings }: Props) {
  if (!product || !booking) {
    return null;
  }

  const { widgetColor } = booking.styles;

  // const settings = {
  //   customPaging: function(i:any) {
  //     return (
  //       <a>
  //         <img src={readFile(product.attachment && product.attachment.url)} alt={product.attachment.name} />
  //       </a>
  //     );
  //   },
  //   dots: true,
  //   dotsClass: "slick-dots slick-thumb",
  //   infinite: true,
  //   speed: 500,
  //   slidesToShow: 1,
  //   slidesToScroll: 1
  // };

  return (
    <div className="product">
      <div>
        <h1>{product.name}</h1>
        <span>{product.description}</span>
      </div>

      <div className="grid-21">
        <div className="">
          {/* <Slider {...settings}>
          {product.attachmentMore?.map( (img:any) => <div>
                 <img src={readFile(img && img.url)} alt={img.name} />
                </div>)
          }
        </Slider> */}

          <img
            src={readFile(product.attachment && product.attachment.url)}
            alt={'apartment'}
          />
        </div>
        <div className="detail">
          <div>Price per unit: {product.unitPrice}</div>
          <div>Sqm: {product.sku}</div>
        </div>
      </div>

      <div className="flex-start">
        <Button
          text="Back"
          onClickHandler={goToBookings}
          style={{ backgroundColor: widgetColor }}
        />
      </div>

      <div className="flex-end">
        <Button
          text={booking.buttonText || 'Захиалах'}
          onClickHandler={() => console.log('call form')}
          style={{ backgroundColor: widgetColor }}
        />
      </div>
    </div>
  );
}

export default Product;
