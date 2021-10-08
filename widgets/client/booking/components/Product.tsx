import * as React from 'react';
import { IBooking, IProduct } from '../types';
import Slider from 'react-slick';
import { getEnv, readFile } from '../../utils';
import Button from './common/Button';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

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
  const settings = {
    dots: true,
    dotsClass: "slick-dots slick-thumb",
    infinite: true,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
  };
  const onSimulate = () => {
    const { ROOT_URL } = getEnv();
    window.open(
      `${ROOT_URL}/test?type=form&brand_id=${booking.formBrandCode}&form_id=${booking.formCode}`,
      'formWindow',
      'width=800,height=800'
    );
  };
  const showFull = (img:any) => {
    const image = document.getElementById( String(img.name));
    if(image){
      //image.src = readFile(img && img.src);
    }
  }

  return (
    <div className="product">
      <div>
        <h1>{product.name}</h1>
        <span>{product.description}</span>
      </div>

      <div className="grid-21 mw-500">
        <div className="slider">
        <a>
        <div className="mw-500" id="img-active">
           <img id ={product.attachment.name} src={readFile(product.attachment && product.attachment.url)} alt={product.attachment.name} /> 
        </div>
        </a>
        
          <Slider className="mw-500" {...settings}>
          {product.attachmentMore?.map( (img:any) =>
               <div className="m-10" onClick={() => showFull(img)}> <img id ={img.name} src={readFile(img && img.url)} alt={img.name} /> </div>
          )
          }
        </Slider>
        </div>
        <div className="detail">
          <div>Price per unit: {product.unitPrice}</div>
          <div>Sqm: {product.sku}</div>
        </div>
      </div>

      <div className="flex-sb">
        <Button
          text="Back"
          onClickHandler={goToBookings}
          style={{ backgroundColor: widgetColor }}
        />
        <Button
          text={booking.buttonText || 'Захиалах'}
          onClickHandler={() => onSimulate()}
          style={{ backgroundColor: widgetColor }}
        />
      </div>
    </div>
  );
}

export default Product;
