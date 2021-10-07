import * as React from 'react';
import { IProductCategory } from '../types';
import { readFile } from '../../utils';

type Props = {
  floor?: IProductCategory;
};

function Floor({ floor }: Props) {
  if (!floor) {
    return null;
  }
  return(
    <div className="grid-13 mt-30">
        <div className="detail">
          <div className="flex-center b mb-10">Давхарын сонголт</div>
          <div className="flex-center" >
          <img src={readFile(floor.attachment.url)} alt="hello" />
          </div>
      </div>
      </div>
  );
}

export default Floor;
