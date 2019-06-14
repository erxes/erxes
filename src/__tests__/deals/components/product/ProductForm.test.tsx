// // test failed info: Invariant Violation: Could not find "client" in the context or passed in as a prop. Wrap the root component in an <ApolloProvider>, or pass an ApolloClient instance in via props.
// import { mount, shallow } from 'enzyme';
// import * as React from 'react';
// import ProductForm from '../../../../modules/deals/components/product/ProductForm';
// import { IDealParams, IProductData } from '../../../../modules/deals/types';
// import { IProduct } from '../../../../modules/settings/productService/types';

// describe('ProductForm component', () => {

//   const testProducts: IProduct[] = [
//     {
//       _id: 'pro123',
//       name: 'qwe',
//       type: 's1',
//       description: 'blabla',
//       sku: 'sku1',
//       createdAt: new Date()
//     },
//     {
//       _id: 'pro23',
//       name: 'qe',
//       type: 's2',
//       description: 'blablabla',
//       sku: 'sku2',
//       createdAt: new Date()
//     }
//   ];

//   const testProductDatas:IProductData[] = [
//     {
//       _id: "pd12",
//       quantity: 2,
//       unitPrice: 1000,
//       taxPercent: 5,
//       tax: 345,
//       discountPercent: 10,
//       discount: 20,
//       amount: 5
//     },
//     {
//       _id: "pd11",
//       quantity: 3,
//       unitPrice: 2000,
//       taxPercent: 6,
//       tax: 347,
//       discountPercent: 11,
//       discount: 25,
//       amount: 9
//     }
//   ];

//   const defaultProps = {
//     onChangeProductsData: (productsData: IProductData[]) => null,
//     saveProductsData: () => null,
//     productsData: testProductDatas,
//     products: testProducts,
//     closeModal: () => null,
//   };

//   test('renders successfully', () => {
//     shallow(<ProductForm {...defaultProps} />);
//   });

//   test('renders with default props', () => {
//     const control = mount(<ProductForm {...defaultProps} />);
//     const props = control.props();

//     expect(props).toMatchObject(defaultProps);
//   });
// });
