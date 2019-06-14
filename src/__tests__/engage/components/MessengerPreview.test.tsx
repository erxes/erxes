// // test failed TypeError: strip_1.default is not a function
// import { mount, shallow } from "enzyme";
// import { IUser } from "modules/auth/types";
// import MessengerPreview from "modules/engage/components/MessengerPreview";
// import * as React from "react";

// describe("MessengerPreview component", () => {
//   const testUsers:IUser[] = [
//     {
//       _id: "u123",
//       username: "john",
// 			email: "J@a.co",
// 			details: {fullName: "Test Name"}

// 		},
// 		{
//       _id: "u124",
//       username: "marco",
//       email: "Jq@a.co"
// 		}
// 	];
//   const defaultProps = {
//     user: testUsers[0]
//   };

//   test("renders successfully", () => {
//     shallow(<MessengerPreview {...defaultProps} />);
//   });

//   test("renders with default props", () => {
//     const control = mount(<MessengerPreview {...defaultProps} />);
//     const props = control.props();

//     expect(props).toMatchObject(defaultProps);
//   });
// });
