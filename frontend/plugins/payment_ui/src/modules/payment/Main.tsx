import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router';

const paymentMain = () => {
  return (
    <Suspense fallback={<div />}>
      <Routes>  
      </Routes>
    </Suspense>
  );
};

export default paymentMain;
