// frontend/plugins/mongolian_ui/src/modules/productplaces/index.tsx
import React from 'react';
import { lazy } from 'react';

// Test if Main is loading
console.log('ProductPlaces index.tsx is loading');
const ProductPlacesMain = lazy(() => {
  console.log('Starting to load ProductPlacesMain');
  return import('./Main').then(module => {
    console.log('ProductPlacesMain loaded successfully');
    return { default: module.default };
  });
});

export const routes = [
  {
    path: 'mongolian/product-places/*',
    element: <ProductPlacesMain />,
  },
];

console.log('ProductPlaces routes exported:', routes);