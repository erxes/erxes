import * as React from 'react';
import { readFile } from '../../../utils';

type Props = {
  title?: string;
  description?: string;
  page?: string;
  image: any;
  children?: React.ReactNode;
};

function Body({ title, description, image, page, children }: Props) {
  let style = 'fullimg';
  if (page == 'floor' || page == 'block-det') {
    style = 'grid-12';
  }
  if(page =='booking'){
    style = 'block-det'
  }
  return (
    <div className="body">
      <h4> {title}</h4>
      <p> {description} </p>
      <div className={style}>
        <img src={readFile(image && image.url)} alt={title} />
      </div>
      {children}
    </div>
  );
}

export default Body;
