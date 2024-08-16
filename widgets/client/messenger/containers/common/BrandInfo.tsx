import * as React from 'react';
import BrandInfo from '../../components/common/BrandInfo';
import { getBrand } from '../../utils/util';

const Container = () => {
  return <BrandInfo brand={getBrand()} />;
};

export default Container;
