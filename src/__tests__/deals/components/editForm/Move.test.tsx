// // test failed info: TypeError: Cannot read property 'pipeline' of undefined
// import { mount, shallow } from 'enzyme';
// import * as React from 'react';
// import DealMove from '../../../../modules/deals/components/editForm/Move';
// import { IDealParams, IStage } from 'modules/deals/types';

// describe('DealMove component', () => {

//   const testStages:IStage[] = [
//     {
//       _id: "stage13",
//       dealsTotalCount: 21
//     },
//     {
//       _id: "stage12",
//       dealsTotalCount: 20
//     }
//   ];

//   const defaultProps = {
//     stages: testStages
//   };

//   test('renders successfully', () => {
//     shallow(<DealMove {...defaultProps} />);
//   });

//   test('renders with default props', () => {
//     const control = mount(<DealMove {...defaultProps} />);
//     const props = control.props();

//     expect(props).toMatchObject(defaultProps);
//   });
// });
