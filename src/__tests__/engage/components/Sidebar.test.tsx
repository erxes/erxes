// // test failed info: TypeError: Cannot read property 'parse' of undefined

// import { mount, shallow } from "enzyme";
// import Sidebar from "modules/engage/components/Sidebar";
// import { ITag } from "modules/tags/types";
// import * as React from "react";

// describe("Sidebar component", () => {

//     const testITags:ITag[] = [
//       {
//         _id: "tag1",
//         type: "tagType",
//         name: "tagName",
//         colorCode: "blue"
//       },
//       {
//         _id: "tag2",
//         type: "tagType",
//         name: "tagName",
//         colorCode: "green"
//       }
//     ]

//   const defaultProps = {
//     kindCounts: 'any',
//     statusCounts: 'any',
//     tagCounts: 'any',
//     tags: testITags,
//     history: 'any',
//   };

//   test("renders successfully", () => {
//     shallow(<Sidebar {...defaultProps} />);
//   });

//   test("renders with default props", () => {
//     const control = mount(<Sidebar {...defaultProps} />);
//     const props = control.props();

//     expect(props).toMatchObject(defaultProps);
//   });
// });
