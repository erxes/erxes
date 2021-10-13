import * as React from 'react';
import { IBooking , IProductCategory } from '../../types';
import { readFile } from '../../../utils';

type Props = {
  title?:string;
  description?:string;
  page?:string;
  image:any;
  children?: React.ReactNode;
};

function Body({ title, description, image, page, children }: Props) {
  let style = "flex-center";
  if(page == "floor"){
      style = "grid-12"
  }
  return (
    <div className="body">
      <h4> {title}</h4>
      <p> {description} </p>
      <div className={style}><img src={readFile(image && image.url)} alt={title} /></div>
     {children}
    </div>
  );
}

export default Body;