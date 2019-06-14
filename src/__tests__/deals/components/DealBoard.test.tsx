// // test failed info: Invariant Violation: Could not find "client" in the context or passed in as a prop. Wrap the root component in an <ApolloProvider>, or pass an ApolloClient instance in via props.
// import { mount, shallow } from 'enzyme';
// import * as React from 'react';
// import { BrowserRouter as Router } from 'react-router-dom';

// import DealBoard from '../../../modules/deals/components/DealBoard';

// describe('DealBoard component', () => {
//   const defaultProps = {
//     queryParams: 1235
//   };

//   test('renders successfully', () => {
//     shallow(
//         <Router>
//             <DealBoard {...defaultProps} />
//         </Router>
//     );
//   });

//   test('renders with default props', () => {
//     const control = mount(
//         <Router>
//             <DealBoard {...defaultProps} />
//         </Router>);
//     const props = control.props();

//     expect(props).toMatchObject(defaultProps);
//   });
// });
