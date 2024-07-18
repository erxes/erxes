import * as React from 'react';
import Skeleton, { SkeletonProps } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const LoadingSkeleton: React.FC<SkeletonProps> = (props) => {
  return <Skeleton {...props} />;
};

export default LoadingSkeleton;
