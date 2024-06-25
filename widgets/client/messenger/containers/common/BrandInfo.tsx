import * as React from 'react';
import BrandInfo from '../../components/common/BrandInfo';
import { useAppContext } from '../AppContext';

const Container = () => {
  const { getBrand } = useAppContext();

  return <BrandInfo brand={getBrand()} />;
};

export default Container;
