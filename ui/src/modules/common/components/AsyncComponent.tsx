import AnimatedLoader from 'modules/common/components/AnimatedLoader';
import Spinner from 'modules/common/components/Spinner';
import React, { lazy, Suspense } from 'react';
import { IAnimatedLoader } from '../types';

export default function asyncComponent(
  importComponent: any,
  loaderStyle?: IAnimatedLoader
) {
  const AsyncComponent = props => {
    let fallback = <Spinner />;

    if (loaderStyle) {
      fallback = <AnimatedLoader loaderStyle={loaderStyle} />;
    }

    const Comp = lazy(importComponent);

    return (
      <Suspense fallback={fallback}>
        <Comp {...props} />
      </Suspense>
    );
  };

  return AsyncComponent;
}
