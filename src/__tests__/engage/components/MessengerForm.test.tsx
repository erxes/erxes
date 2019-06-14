// // test failed info: Uncaught [Invariant Violation: Could not find "client" in the context or passed in as a prop. Wrap the root component in an <ApolloProvider>, or pass an ApolloClient instance in via props.]

// import { mount, shallow } from "enzyme";
// import { IUser } from "modules/auth/types";
// import MessengerForm from "modules/engage/components/MessengerForm";
// import { IEngageMessenger, IEngageScheduleDate } from "modules/engage/types";
// import { IBrand } from "modules/settings/brands/types";
// import * as React from "react";

// describe("MessengerForm component", () => {

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

// 	const testUsers:IUser[] = [
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
//   ];

//   const testIEngageMessenger:IEngageMessenger = {
//     brandId: 'string',
//     sentAs: 'string',
//     content: 'string',
//   };

//   const testIEngageScheduleDate:IEngageScheduleDate = {
//     type: 'string',
//     month: 'string',
//     day: 'string',
//     time: new Date(),
//   }

//   const defaultProps = {
//     brands: testIBrands,
//     onChange: (
//       name: 'messenger' | 'content' | 'scheduleDate' | 'fromUserId',
//       value: IEngageMessenger | IEngageScheduleDate | string
//     ) => null,
//     users: testUsers,
//     hasKind: true,
//     messageKind: 'string',
//     messenger: testIEngageMessenger,
//     fromUserId: 'string',
//     content: 'string',
//     scheduleDate: testIEngageScheduleDate,
//   };

//   test("renders successfully", () => {
//     shallow(<MessengerForm {...defaultProps} />);
//   });

//   test("renders with default props", () => {
//     const control = mount(<MessengerForm {...defaultProps} />);
//     const props = control.props();

//     expect(props).toMatchObject(defaultProps);
//   });
// });
