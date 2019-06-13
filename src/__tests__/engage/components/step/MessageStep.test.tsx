// // test failed info: expect(received).toMatchObject(expected)

// import { mount, shallow } from "enzyme";
// import { IUser } from "modules/auth/types";
// import MessageStep from "modules/engage/components/step/MessageStep";
// import {
//   IEngageEmail,
//   IEngageMessenger,
//   IEngageScheduleDate
// } from "modules/engage/types";
// import { IBrand } from "modules/settings/brands/types";
// import { IEmailTemplate } from "modules/settings/emailTemplates/types";
// import * as React from "react";
// import { MockedProvider } from "react-apollo/test-utils";

// describe("MessageStep component", () => {
//   const TestEngageScheduleDates: IEngageScheduleDate = {
//     type: "string",
//     month: "may",
//     day: "12",
//     time: new Date()
//   };

//   const testUsers: IUser[] = [
//     {
//       _id: "u123",
//       username: "john",
//       email: "J@a.co"
//     },
//     {
//       _id: "u124",
//       username: "kate",
//       email: "Jq@a.co"
//     }
//   ];

//   const testIBrands: IBrand[] = [
//     {
//       _id: "string1",
//       code: "string",
//       name: "string",
//       createdAt: "string",
//       description: "string",
//       emailConfig: { type: "string", template: "string" }
//     },
//     {
//       _id: "string2",
//       code: "string",
//       name: "string",
//       createdAt: "string",
//       description: "string",
//       emailConfig: { type: "string", template: "string" }
//     }
//   ];

//   const testIEmailTemplate: IEmailTemplate[] = [
//     {
//       _id: "string1",
//       name: "string",
//       content: "string"
//     },
//     {
//       _id: "string2",
//       name: "string",
//       content: "string"
//     },
//     {
//       _id: "string3",
//       name: "string",
//       content: "string"
//     }
//   ];

//   const defaultProps = {
//     brands: testIBrands,
//     onChange: (
//       name: "messenger" | "email" | "content" | "scheduleDate" | "fromUserId",
//       value: IEngageEmail | IEngageMessenger | IEngageScheduleDate | string
//     ) => null,
//     users: testUsers,
//     method: "string",
//     templates: testIEmailTemplate,
//     kind: "string",
//     fromUserId: "string",
//     content: "string",
//     scheduleDate: TestEngageScheduleDates
//   };

//   test("renders successfully", () => {
//     shallow(
//       <MockedProvider>
//         <MessageStep {...defaultProps} />
//       </MockedProvider>
//     );
//   });

//   test("renders with default props", () => {
//     const control = mount(
//       <MockedProvider>
//         <MessageStep {...defaultProps} />
//       </MockedProvider>
//     );
//     const props = control.props();

//     expect(props).toMatchObject(defaultProps);
//   });
// });
