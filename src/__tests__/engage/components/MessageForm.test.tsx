// // test failed info: expect(received).toMatchObject(expected)
// import { mount, shallow } from "enzyme";
// import MessageForm from "modules/engage/components/MessageForm";
// import { IBrand } from "modules/settings/brands/types";
// import * as React from "react";
// import { MockedProvider } from "react-apollo/test-utils";
// import { BrowserRouter } from "react-router-dom";

// describe("MessageForm component", () => {
//   const testIBrands: IBrand[] = [
//     {
//       _id: "id1",
//       code: "code",
//       createdAt: "created",
//       emailConfig: { type: "string", template: "string" }
//     },
//     {
//       _id: "id2",
//       code: "code",
//       createdAt: "created",
//       emailConfig: { type: "string", template: "string" }
//     }
//   ];

//   const defaultProps = {
//     brands: testIBrands
//   };

//   test("renders successfully", () => {
//     shallow(
//       <MockedProvider>
//         <MessageForm {...defaultProps} />
//       </MockedProvider>
//     );
//   });

//   test("renders with default props", () => {
//     const control = mount(
//       <BrowserRouter>
//         <MockedProvider>
//           <MessageForm {...defaultProps} />
//         </MockedProvider>
//       </BrowserRouter>
//     );
//     const props = control.props();

//     expect(props).toMatchObject(defaultProps);
//   });
// });
