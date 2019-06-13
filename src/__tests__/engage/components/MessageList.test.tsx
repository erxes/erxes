// // test failed info: IEngageMessage->ISegment object has object itself
// import { mount, shallow } from "enzyme";
// import List from "modules/engage/components/MessageList";
// import { IEngageMessage } from "modules/engage/types";
// import * as React from "react";
// import { MockedProvider } from "react-apollo/test-utils";
// import { BrowserRouter } from "react-router-dom";

// describe("List component", () => {

//   const testIEngageMessage:IEngageMessage[] = [
//     {
//       _id: 'string',
//       stopDate: new Date(),
//       createdDate: new Date(),
//       messengerReceivedCustomerIds?: ['13', '123'],
//       deliveryReports?: JSON,
//       stats?: IEngageStats,
//       brand: IBrand,
//       segment: ISegment,
//       fromUser: IUser,
//       tagIds: string[],
//       getTags: ITag[],
//     }
//   ];

//   const defaultProps = {
//     messages: testIEngageMessage,
//     totalCount: 3,
//     bulk: ['123', 1],
//     isAllSelected: true,
//     emptyBulk: () => null,
//     toggleBulk: (target: IEngageMessage, toAdd: boolean) => null,
//     toggleAll: (targets: IEngageMessage[], name: string) => null,
//     loading: false,
//     queryParams: 'any',
//   };

//   test("renders successfully", () => {
//     shallow(
//       <MockedProvider>
//         <List {...defaultProps} />
//       </MockedProvider>
//     );
//   });

//   test("renders with default props", () => {
//     const control = mount(
//       <BrowserRouter>
//         <MockedProvider>
//           <List {...defaultProps} />
//         </MockedProvider>
//       </BrowserRouter>
//     );
//     const props = control.props();

//     expect(props).toMatchObject(defaultProps);
//   });
// });
