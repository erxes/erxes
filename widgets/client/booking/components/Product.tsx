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
  const onSimulate = () => {
    const { ROOT_URL } = getEnv();
    window.open(
      `${ROOT_URL}/test?type=form&brand_id=${booking.formBrandCode}&form_id=${booking.formCode}`,
      'formWindow',
      'width=800,height=800'
    );
  };

  const showFull = (img:any) => {
    const image = document.getElementById("img-active") as HTMLImageElement;
    if(image){
      image.src = readFile(img && img.url);
    }
  }

  const renderDetail = () =>{
    // console.log(product)
    // const {sku, customFieldsDataWithText, } = product;

    // if(customFieldsDataWithText){
        
    //       return <div>
    //          <span>{`Id is: ${}`}</span>
    //          <span>{`Name is: `}</span>
    //       </div>
 
    // }

    return(
      <div>vhjk</div>
    )
  }

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
           <img id="img-active" src={readFile(product.attachment && product.attachment.url)} alt={product.attachment.name} /> 
        </div>
        <div>
        <Slider {...settings} >
          {product.attachmentMore?.map( (img:any) =>
               <div onClick={() => showFull(img)}> <img id ={img.name} src={readFile(img && img.url)} alt={img.name} /> </div>
          )
          }
        </Slider>
        </div>   
        </div>
        <div className="detail">
          {renderDetail}
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
