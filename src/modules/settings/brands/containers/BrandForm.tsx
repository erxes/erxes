import * as React from 'react';
import { ChildProps } from "react-apollo";
import { BrandForm } from '../components';
import { IBrand } from '../types';

type Props = {
    brand: IBrand,
    save: () => void,
    loading: boolean
};

const BrandFormContainer = (props: ChildProps<Props>) => {
  const { brand, save } = props;

  const updatedProps = {
    ...props,
    brand,
    save
  };

  return <BrandForm {...updatedProps} />;
};

export default BrandFormContainer;
