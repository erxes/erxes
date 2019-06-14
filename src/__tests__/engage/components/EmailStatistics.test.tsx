// // test failed info: ISegment, object has object itself
// import { mount, shallow } from "enzyme";
// import EmailStatistics from "modules/engage/components/EmailStatistics";
// import { IEngageMessage } from "modules/engage/types";
// import * as React from "react";

// describe("EmailStatistics component", () => {

//   const testIEngageMessage:IEngageMessage = {
//     _id: string,
//     stopDate: Date,
//     createdDate: Date,
//     messengerReceivedCustomerIds?: string[],
//     deliveryReports?: JSON,
//     stats?: IEngageStats,
//     brand: IBrand,
//     segment: ISegment,
//     fromUser: IUser,
//     tagIds: string[],
//     getTags: ITag[],
//   };

//   const defaultProps = {
//     message: testIEngageMessage;
//   };

//   test("renders successfully", () => {
//     shallow(<EmailStatistics {...defaultProps} />);
//   });

//   test("renders with default props", () => {
//     const control = mount(<EmailStatistics {...defaultProps} />);
//     const props = control.props();

//     expect(props).toMatchObject(defaultProps);
//   });
// });
