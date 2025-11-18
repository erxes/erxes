import { Route, Routes } from 'react-router';
import { Suspense, lazy } from 'react';

const Pos = lazy(() =>
  import('~/pages/PosIndexPage').then((module) => ({
    default: module.PosIndexPage,
  })),
);

const PluginPos = () => {
  return <>aa</>;
};

export default PluginPos;
