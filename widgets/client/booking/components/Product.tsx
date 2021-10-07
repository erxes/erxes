import * as React from 'react';
import { IBooking, IProduct } from '../types';
import Slider from 'react-slick';

type Props = {
  product?: IProduct;
  booking: IBooking;
};

function Product({ product }: Props) {
  if (!product) {
    return null;
  }
  // const baseUrl="sdsdfsdfg"
  // console.log(product)
  // const settings = {
  //   customPaging: function(i:any) {
  //     return (
  //       <a>
  //         <img src={`${baseUrl}/abstract0${i + 1}.jpg`} />
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
    <div>
      <h1>{product.name}</h1>
      {/* <Slider {...settings}>
          <div>
            <img src={baseUrl + "/abstract01.jpg"} />
          </div>
          <div>
            <img src={baseUrl + "/abstract02.jpg"} />
          </div>
          <div>
            <img src={baseUrl + "/abstract03.jpg"} />
          </div>
          <div>
            <img src={baseUrl + "/abstract04.jpg"} />
          </div>
        </Slider> */}
    </div>
  );
}

export default Product;
