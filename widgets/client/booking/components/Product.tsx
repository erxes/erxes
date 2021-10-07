import * as React from 'react';
import { IProduct } from '../types';
import Slider from "react-slick";
import { readFile } from '../../utils';

type Props = {
  product?: IProduct;
};

function Product({ product }: Props) {
  if (!product) {
    return null;
  }
  
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
        
        <img src={readFile(product.attachment && product.attachment.url)} alt={product.attachment.name} /></div>
          <div className="detail">
            <div>Price per unit: {product.unitPrice}</div>
            <div>Sqm: {product.sku}</div>
          </div>
      </div>
     </div>
  );
}

export default Product;
