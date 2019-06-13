// // test failed info: ICustomer->ICompany[] object has object itself
// import { mount, shallow } from "enzyme";
// import Widget from "modules/engage/components/Widget";
// import { IEngageMessageDoc } from "modules/engage/types";
// import * as React from "react";

// describe("Widget component", () => {
//   const testIEmailTemplate:IEmailTemplate[] = [
//     {
//       _id: 'email1',
//       name: 'string',
//       content: 'string',
//     },
//     {
//       _id: 'email2',
//       name: 'string',
//       content: 'string',
//     }
//   ];

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

//   const testCustomers:ICustomer[] = [
//     {
//       _id: "c1",
//       getTags: testTags,
//       companies: testCompanies,
//       firstName: "John",
//       lastName: "JJ"
//     }
//   ];

//   const defaultProps = {
//     emailTemplates: IEmailTemplate[],
//     brands: IBrand[],
//     customers: ICustomer[],
//     messengerKinds: any[],
//     sentAsChoices: any[],
//     save: (doc: IEngageMessageDoc, closeModal: () => void) => null,
//   };

//   test("renders successfully", () => {
//     shallow(<Widget {...defaultProps} />);
//   });

//   test("renders with default props", () => {
//     const control = mount(<Widget {...defaultProps} />);
//     const props = control.props();

//     expect(props).toMatchObject(defaultProps);
//   });
// });
