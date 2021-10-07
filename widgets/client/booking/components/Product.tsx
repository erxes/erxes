import * as React from 'react';
import { IProduct } from '../types';
import Slider from "react-slick";
import { readFile } from '../../utils';
import "~slick-carousel/slick/slick.css"; 
import "~slick-carousel/slick/slick-theme.css";

type Props = {
  product?: IProduct;
};

function Product({ product }: Props) {
  if (!product) {
    return null;
  }
  
  const settings = {
    customPaging: function(i:any) {
      return (
        <a>
          <img src={readFile(product.attachment && product.attachment.url)} alt={product.attachment.name} />
        </a>
      );
    },
    dots: true,
    dotsClass: "slick-dots slick-thumb",
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1
  };

  return (
    <div>
      <h1>{product.name}</h1>
      <Slider {...settings}>
          {product.attachmentMore?.map( (img:any) => <div>
                 <img src={readFile(img && img.url)} alt={img.name} />
                </div>)
          }
        </Slider>
     </div>
  );
}

export default Product;
