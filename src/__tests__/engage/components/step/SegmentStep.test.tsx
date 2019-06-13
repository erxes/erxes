// // test failed info: ISegment, object has object itself

// import { mount, shallow } from "enzyme";
// import SegmentStep from "modules/engage/components/step/SegmentStep";
// import { ISegment } from "modules/segments/types";
// import * as React from "react";

// describe("SegmentStep component", () => {

//   const testIsegment:ISegment;
//   const testIsegments:ISegment[] = [
//     {
//       _id: 'string1',
//       contentType: 'string',
//       getSubSegments: ,
//       getParentSegment: ISegment,
//     }
//   ]
//   const defaultProps = {
//     onChange: (name: 'segmentId', value: string) => null,
//     segments: ISegment[],
//     headSegments: ISegment[],
//     segmentFields: ISegmentField[],
//     segmentAdd: (params: { doc: ISegmentDoc }) => null,
//     counts: 'any',
//     count: (segment: ISegmentDoc) => null,
//     segmentId: 'string',
//   };

//   test("renders successfully", () => {
//     shallow(<SegmentStep {...defaultProps} />);
//   });

//   test("renders with default props", () => {
//     const control = mount(<SegmentStep {...defaultProps} />);
//     const props = control.props();

//     expect(props).toMatchObject(defaultProps);
//   });
// });
