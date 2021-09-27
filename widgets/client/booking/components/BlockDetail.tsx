import * as React from 'react';
import { IProductCategory } from '../types';

type Props = {
  floors: IProductCategory[];
};

function BlockDetail({ floors }: Props) {
  return (
    <div>
      {floors.map(floor => {
        return <h1>{floor.name}</h1>;
      })}
    </div>
  );
}

export default BlockDetail;
