import * as React from 'react';
import { IProductCategory } from '../types';

type Props = {
  floor?: IProductCategory;
};

function Floor({ floor }: Props) {
  if (!floor) {
    return null;
  }
  return <div>{floor.name}</div>;
}

export default Floor;
