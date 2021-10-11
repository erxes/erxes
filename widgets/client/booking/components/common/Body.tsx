import * as React from 'react';
import { IBooking , IProductCategory } from '../../types';
import { readFile } from '../../../utils';

type Props = {
  title?:string;
  description?:string;
  page?:string;
  image:any;
};

function Body({ title, description, image, page }: Props) {
  let style = { text:"flex-center" , main:"img" };
  if(page == "floor"){
      style.main = "grid-12"
  }
  return (
    <>
      <div className={style.text}> {title}</div>
      <div className={style.text}> {description} </div>
      <div className={style.main} >
          <img src={readFile(image && image.url)} alt={title} />
      </div>
    </>
  );
}

export default Body;